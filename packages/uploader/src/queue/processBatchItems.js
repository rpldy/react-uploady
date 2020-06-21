// @flow
import {
    triggerUpdater,
    isSamePropInArrays,
    FILE_STATES,
    logger,
    getMerge
} from "@rpldy/shared";
import { unwrap } from "@rpldy/simple-state";
import { UPLOADER_EVENTS } from "../consts";
import processFinishedRequest from "./processFinishedRequest";

import type { BatchItem } from "@rpldy/shared";
import type { SendResult } from "@rpldy/sender";
import type { CreateOptions } from "../types";
import type { QueueState, ProcessNextMethod } from "./types";

type ItemsSendData = {
    items: BatchItem[],
    options: CreateOptions
}

const mergeWithUndefined = getMerge({ undefinedOverwrites: true });

const triggerPreSendUpdate = async (queue: QueueState, items: BatchItem[], options: CreateOptions): Promise<ItemsSendData> => {
    // $FlowFixMe - https://github.com/facebook/flow/issues/8215
    const updated: {items?: BatchItem[], options?: CreateOptions } = await triggerUpdater<BatchItem[], CreateOptions>(
		queue.trigger, UPLOADER_EVENTS.REQUEST_PRE_SEND, {
			items: unwrap(items),
			options: unwrap(options),
		});

    if (updated) {
        logger.debugLog(`uploader.queue: REQUEST_PRE_SEND event returned updated items/options`, updated);
        if (updated.items) {
            //can't change items count at this point. removing can be done by cancelling with UPLOADER_EVENTS.ITEM_START
            if (updated.items.length !== items.length ||
                !isSamePropInArrays(updated.items, items, ["id", "batchId"])) {
                throw new Error(`REQUEST_PRE_SEND event handlers must return same items with same ids`);
            }

            items = updated.items;
        }

        if (updated.options) {
            options = mergeWithUndefined({}, options, updated.options);
        }
    }

    return { items, options };
};

const prepareAllowedItems = async (queue: QueueState, items: BatchItem[]): Promise<ItemsSendData> => {
    const allowedIds = items.map((item: BatchItem) => item.id);

    queue.updateState((state) => {
        state.activeIds = state.activeIds.concat(allowedIds);
    });

    const options = queue.getState().batches[items[0].batchId].batchOptions;

    return await triggerPreSendUpdate(queue, items, options);
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

const sendAllowedItems = async (queue: QueueState, itemsSendData: ItemsSendData, next: ProcessNextMethod) => {
    const { items, options } = itemsSendData;
    const batch = queue.getState().batches[items[0].batchId].batch;
    const sendResult = queue.sender.send(items, batch, options);

    updateUploadingState(queue, items, sendResult);

    const requestInfo = await sendResult.request; //wait for server request to return

    const finishedData = items.map((item) => ({
        id: item.id,
        info: requestInfo,
    }));

    processFinishedRequest(queue, finishedData, next);
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

        processFinishedRequest(queue, finishedData, next); //report out info about cancelled items
    }

    return !!cancelledItemsIds.length;
};

//make sure item is still pending. Something might have changed while waiting for ITEM_START handling. Maybe someone called abort...
const getAllowedItem = (id: string, queue: QueueState) =>
	queue.getState().items[id];

//send group of items to be uploaded
export default async (queue: QueueState, ids: string[], next: ProcessNextMethod) => {
    const state = queue.getState();
    //multiple items can happen when grouping is allowed
    let items: any[] = Object.values(state.items);
    items = items.filter((item: BatchItem) => !!~ids.indexOf(item.id));

    //allow external code to cancel items
    const cancelledResults = await Promise.all(items.map((i: BatchItem) =>
        queue.cancellable(UPLOADER_EVENTS.ITEM_START, i)));

    let allowedItems: BatchItem[] = cancelledResults
        .map((isCancelled: boolean, index: number): ?BatchItem =>
			isCancelled ? null : getAllowedItem(items[index].id, queue))
        .filter(Boolean);

    if (allowedItems.length) {
        const itemsSendData = await prepareAllowedItems(queue, allowedItems);
        sendAllowedItems(queue, itemsSendData, next); //we dont need to wait for the response here
    }

    //if no cancelled we can go to process more items immediately (and not wait for upload responses)
    if (!reportCancelledItems(queue, items, cancelledResults, next)) {
        await next(queue); //when concurrent is allowed, we can go ahead and process more
    }
};

