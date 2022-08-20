// @flow
import { FILE_STATES, logger } from "@rpldy/shared";
import processBatchItems from "./processBatchItems";
import {
    getIsBatchReady,
    isNewBatchStarting,
    cancelBatchForItem,
    loadNewBatchForItem,
    failBatchForItem,
} from "./batchHelpers";

import type { BatchItem } from "@rpldy/shared";
import type { QueueState } from "./types";

const getIsItemInActiveRequest = (queue: QueueState, itemId: string): boolean => {
    return queue.getState().activeIds
        // $FlowIssue - no flat
        .flat()
        .includes(itemId);
};

const getIsItemReady = (item: BatchItem) =>
    item.state === FILE_STATES.ADDED;

export const findNextItemIndex = (queue: QueueState): ?[string, number] => {
    const state = queue.getState(),
        itemQueue = state.itemQueue,
        items = state.items;

    let nextItemId = null,
        batchIndex = 0,
        itemIndex = 0,
        batchId = state.batchQueue[batchIndex];

    while (batchId && !nextItemId) {
        if (getIsBatchReady(queue, batchId)) {
            nextItemId = itemQueue[batchId][itemIndex];

            while (nextItemId &&
            (getIsItemInActiveRequest(queue, nextItemId) ||
                !getIsItemReady(items[nextItemId]))) {
                itemIndex += 1;
                nextItemId = itemQueue[batchId][itemIndex];
            }
        }

        if (!nextItemId) {
            batchIndex += 1;
            batchId = state.batchQueue[batchIndex];
            itemIndex = 0;
        }
    }

    return nextItemId ? [batchId, itemIndex] : null;
};

export const getNextIdGroup = (queue: QueueState): ?string[] => {
    const state = queue.getState(),
        itemQueue = state.itemQueue,
     [nextBatchId, nextItemIndex] = findNextItemIndex(queue) || [];

    let nextId = (nextBatchId && ~nextItemIndex) ? itemQueue[nextBatchId][nextItemIndex] : null,
        nextGroup;

    if (nextId) {
        const { batchOptions } = state.batches[nextBatchId],
            groupMax = batchOptions.maxGroupSize || 0;

        if (batchOptions.grouped && groupMax > 1) {
            const batchItems = state.itemQueue[nextBatchId];
            //get ids for the batch with max of configured group size (never mix items from different batches)
            nextGroup = batchItems.slice(nextItemIndex, nextItemIndex + groupMax);
        } else {
            nextGroup = [nextId];
        }
    }

    return nextGroup;
};

const updateItemsAsActive = (queue: QueueState, ids) => {
    queue.updateState((state) => {
        //immediately mark items as active to support concurrent uploads without getting into infinite loops
        state.activeIds = state.activeIds.concat(ids);
    });
};

const processNextWithBatch = (queue, ids) => {
    let newBatchP;

    updateItemsAsActive(queue, ids);

    if (isNewBatchStarting(queue, ids[0])) {
        newBatchP = loadNewBatchForItem(queue, ids[0])
            .then((allowBatch) => {
                let cancelled = !allowBatch;

                if (cancelled) {
                    cancelBatchForItem(queue, ids[0]);
                    processNext(queue);
                }

                return cancelled;
            })
            .catch((err) => {
                logger.debugLog("uploader.processor: encountered error while preparing batch for request", err);
                failBatchForItem(queue, ids[0], err);
                processNext(queue);
                return true;
            });
    } else {
        newBatchP = Promise.resolve(false);
    }

    return newBatchP;
};

const processNext = (queue: QueueState): Promise<void> | void => {
    //using promise only for testing purposes, actual code doesnt require awaiting on this method
    let processPromise;

    const ids = getNextIdGroup(queue);

    if (ids) {
        const currentCount = queue.getCurrentActiveCount(),
            { concurrent = 0, maxConcurrent = 0 } = queue.getOptions();

        if (!currentCount || (concurrent && currentCount < maxConcurrent)) {
            logger.debugLog("uploader.processor: Processing next upload - ", {
                ids,
                currentCount,
            });

            processPromise = processNextWithBatch(queue, ids)
                .then((failedOrCancelled: boolean) => {
                    if (!failedOrCancelled) {
                        processBatchItems(queue, ids, processNext);

                        if (concurrent) {
                            //concurrent process next immediately (otherwise async event callbacks will hang processing next until they complete)
                            processNext(queue);
                        }
                    }
                });
        }
    }

    return processPromise;
};

export default processNext;
