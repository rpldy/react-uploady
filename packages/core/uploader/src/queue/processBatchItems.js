// @flow
import {
    triggerUpdater,
    isSamePropInArrays,
    FILE_STATES,
    logger,
    getMerge
} from "@rpldy/shared";
import { UPLOADER_EVENTS } from "../consts";
import processFinishedRequest from "./processFinishedRequest";

import type { BatchItem, UploadData } from "@rpldy/shared";
import type { SendResult } from "@rpldy/sender";
import type { CreateOptions } from "../types";
import type { QueueState, ProcessNextMethod } from "./types";

type ItemsSendData = {
    items: BatchItem[],
    options: CreateOptions,
	cancelled?: boolean,
};

const mergeWithUndefined = getMerge({ undefinedOverwrites: true });

const triggerPreSendUpdate = (queue: QueueState, items: BatchItem[], options: CreateOptions): Promise<ItemsSendData> => {
    return triggerUpdater<{ items: BatchItem[], options: CreateOptions }>(
        queue.trigger, UPLOADER_EVENTS.REQUEST_PRE_SEND, { items, options })
        // $FlowFixMe - https://github.com/facebook/flow/issues/8215
        .then((updated: ?{ items: BatchItem[], options: CreateOptions }) => {
            if (updated) {
                logger.debugLog(`uploader.queue: REQUEST_PRE_SEND event returned updated items/options`, updated);
                if (updated.items) {
                    //can't change items count at this point.
                    if (updated.items.length !== items.length ||
                        !isSamePropInArrays(updated.items, items, ["id", "batchId", "recycled"])) {
                        throw new Error(`REQUEST_PRE_SEND event handlers must return same items with same ids`);
                    }

                    items = updated.items;
                }

                if (updated.options) {
                    options = mergeWithUndefined({}, options, updated.options);
                }
            }

            return { items, options, cancelled: (updated === false) };
        });
};

const prepareAllowedItems = (queue: QueueState, items: BatchItem[]): Promise<ItemsSendData> => {
    const allowedIds = items.map((item: BatchItem) => item.id);

    queue.updateState((state) => {
        state.activeIds = state.activeIds.concat(allowedIds);
    });

	return triggerPreSendUpdate(queue, items,
		queue.getState().batches[items[0].batchId].batchOptions)
        .then((prepared: { items: BatchItem[], options: CreateOptions, cancelled?: boolean }) => {
            if (!prepared.cancelled) {
                //update potentially changed data back into queue state
                queue.updateState((state) => {
                    prepared.items.forEach((i) => {
                        state.items[i.id] = i;
                    });

                    state.batches[items[0].batchId].batchOptions = prepared.options;
                });

                //use objects from internal state(proxies) - not objects from userland
                const updatedState = queue.getState();
                prepared.items = prepared.items.map((item) => updatedState.items[item.id]);
                prepared.options = updatedState.batches[items[0].batchId].batchOptions;
            }

            return prepared;
        });
};

const updateUploadingState = (queue: QueueState, items: BatchItem[], sendResult: SendResult) => {
    queue.updateState((state) => {
        items.forEach((bi) => {
            const item = state.items[bi.id];
            item.state = FILE_STATES.UPLOADING;
            state.aborts[bi.id] = sendResult.abort;
        });
    });
};

const sendAllowedItems = (queue: QueueState, itemsSendData: ItemsSendData, next: ProcessNextMethod) => {
    const { items, options } = itemsSendData;
    const batch = queue.getState().batches[items[0].batchId].batch;

    let sendResult: ?SendResult;

    try {
        sendResult = queue.sender.send(items, batch, options);
    }
    catch (ex) {
        logger.debugLog(`uploader.queue: sender failed with unexpected error`, ex);
        //provide error result so file(s) are marked as failed
        sendResult = {
            request: Promise.resolve({
                status: 0,
                state: FILE_STATES.ERROR,
                response: ex.message,
            }),
            abort: () => false,
            senderType: "exception-handler",
        };
    }

    updateUploadingState(queue, items, sendResult);

    return sendResult.request
        //wait for server request to return
        .then((requestInfo: UploadData) => {
            const finishedData = items.map((item) => ({
                id: item.id,
                info: requestInfo,
            }));

            processFinishedRequest(queue, finishedData, next);
        });
};

const reportCancelledItems = (queue: QueueState, items: BatchItem[], cancelledResults: boolean[], next: ProcessNextMethod): boolean => {
    const cancelledItemsIds: string[] = cancelledResults
        .map((isCancelled: boolean, index: number) => isCancelled ? items[index].id : null)
        .filter(Boolean);

    if (cancelledItemsIds.length) {
        const finishedData = cancelledItemsIds.map((id: string) => ({
            id,
            info: { status: 0, state: FILE_STATES.CANCELLED, response: "cancel" },
        }));

        processFinishedRequest(queue, finishedData, next); //report about cancelled items
    }

    return !!cancelledItemsIds.length;
};

//make sure item is still pending. Something might have changed while waiting for ITEM_START handling. Maybe someone called abort...
const getAllowedItem = (id: string, queue: QueueState) =>
	queue.getState().items[id];

//send group of items to be uploaded
const processBatchItems = (queue: QueueState, ids: string[], next: ProcessNextMethod): Promise<void> => {
    const state = queue.getState();
    //ids will have more than one when grouping is allowed
    let items: any[] = Object.values(state.items);
    items = items.filter((item: BatchItem) => !!~ids.indexOf(item.id));

    //allow user code cancel items from start event handler(s)
    return Promise.all(items.map((i: BatchItem) =>
        queue.runCancellable(UPLOADER_EVENTS.ITEM_START, i)))
        .then((cancelledResults) => {
            let allowedItems: BatchItem[] = cancelledResults
                .map((isCancelled: boolean, index: number): ?BatchItem =>
                    isCancelled ? null : getAllowedItem(items[index].id, queue))
                .filter(Boolean);

            return { allowedItems, cancelledResults };
        })
        .then(({ allowedItems, cancelledResults }) => {
            const afterPreparePromise = allowedItems.length ?
                prepareAllowedItems(queue, allowedItems)
                    .then() : Promise.resolve();

            return afterPreparePromise
                .then((itemsSendData: ?ItemsSendData) => {
                    let nextP;

                    if (itemsSendData) {
                        if (itemsSendData.cancelled) {
                            cancelledResults = ids.map(() => true);
                        } else {
                            //we dont need to wait for the response here
                            sendAllowedItems(queue, itemsSendData, next);
                        }
                    }

                    //if no cancelled we can go to process more items immediately (and not wait for upload responses)
                    if (!reportCancelledItems(queue, items, cancelledResults, next)) {
                        nextP = next(queue); //when concurrent is allowed, we can go ahead and process more
                    }

                    return nextP;
                });
        });
};

export default processBatchItems;
