// @flow
import { getMerge, isSamePropInArrays, logger, triggerUpdater } from "@rpldy/shared";
import { getIsItemFinalized } from "./itemHelpers";

import type { BatchItem } from "@rpldy/shared";
import type { QueueState } from "./types";
import type { UploaderCreateOptions } from "../types";

export type ItemsSendData = {
    items: BatchItem[],
    options: UploaderCreateOptions,
    cancelled?: boolean,
};

type ItemsRetriever<T> = (subject: T) => BatchItem[];
type SubjectRetriever<T> = (subject: T, UploaderCreateOptions) => Object;
type ItemsPreparer<T> = (queue: QueueState, subject: T) => Promise<ItemsSendData>;
type ResponseValidator = (updated: any) => void;
type UpdatedResponse = { items: BatchItem[], options: UploaderCreateOptions };

const mergeWithUndefined = getMerge({ undefinedOverwrites: true });

const processPrepareResponse = (eventType: string, items: BatchItem[], options: UploaderCreateOptions, updated: ?UpdatedResponse) => {
    let usedOptions = options, usedItems = items;

    if (updated) {
        logger.debugLog(`uploader.queue: REQUEST_PRE_SEND(${eventType}) event returned updated items/options`, updated);
        if (updated.items) {
            //can't change items count at this point.
            if (updated.items.length !== items.length ||
                !isSamePropInArrays(updated.items, items, ["id", "batchId", "recycled"])) {
                throw new Error(`REQUEST_PRE_SEND(${eventType}) event handlers must return same items with same ids`);
            }

            usedItems = updated.items;
        }

        if (updated.options) {
            usedOptions = mergeWithUndefined({}, options, updated.options);
        }
    }

    return { items: usedItems, options: usedOptions, cancelled: (updated === false) };
};

const triggerItemsPrepareEvent = (
    queue: QueueState,
    eventSubject: Object,
    items: BatchItem[],
    options: UploaderCreateOptions,
    eventType: string,
    validateResponse: ?ResponseValidator
): Promise<ItemsSendData> =>
    triggerUpdater<{ subject: Object, options: UploaderCreateOptions }>(
        queue.trigger, eventType, eventSubject, options)
        // $FlowIssue - https://github.com/facebook/flow/issues/8215
        .then((updated: ?UpdatedResponse) => {
            validateResponse?.(updated);
            return processPrepareResponse(eventType, items, options, updated);
        });

const persistPrepareResponse = (queue: QueueState, prepared: ItemsSendData) => {
    const batchId = prepared.items[0].batchId;

    //for async prepare, items could already be cancelled before we reach here
    if (prepared.items[0] && queue.getState().batches[batchId]) {
        queue.updateState((state) => {
            //update potentially changed data back into queue state
            prepared.items.forEach((i) => {
                //update item if it is NOT finished (ex: aborted)
                if (!getIsItemFinalized(state.items[i.id])) {
                    state.items[i.id] = i;
                }
            });

            const batchData = state.batches[batchId];
            prepared.items.forEach(({ id }) => {
                batchData.itemBatchOptions[id] = prepared.options;
            });
        });

        //use objects from internal state(proxies) - not objects from user-land!
        const updatedState = queue.getState();
        prepared.items = prepared.items.map((item) => updatedState.items[item.id]);
        const batchData = updatedState.batches[batchId];
        prepared.options = batchData.itemBatchOptions[prepared.items[0].id] || batchData.batchOptions;
    }
};

const prepareItems = <T>(
    queue: QueueState,
    subject: T,
    retrieveItemsFromSubject: ItemsRetriever<T>,
    createEventSubject: ?SubjectRetriever<T>,
    validateResponse: ?ResponseValidator,
    eventType: string
): Promise<ItemsSendData> => {
    const items = retrieveItemsFromSubject(subject);
    const batchOptions = queue.getState().batches[items[0].batchId].batchOptions;
    const eventSubject: Object = createEventSubject?.(subject, batchOptions) || subject;

    return triggerItemsPrepareEvent(queue, eventSubject, items, batchOptions, eventType, validateResponse)
        .then((prepared: ItemsSendData) => {
            if (!prepared.cancelled) {
                persistPrepareResponse(queue, prepared);
            }

            return prepared;
        });
};

const getItemsPrepareUpdater =
    <T>(
        eventType: string,
        retrieveItemsFromSubject: ItemsRetriever<T>,
        createEventSubject: ?SubjectRetriever<T> = null,
        validateResponse: ?ResponseValidator = null
    ): ItemsPreparer<T> =>
        (queue: QueueState, subject: T) =>
            prepareItems<T>(
                queue,
                subject,
                retrieveItemsFromSubject,
                createEventSubject,
                validateResponse,
                eventType
            );

export {
    getItemsPrepareUpdater,
};
