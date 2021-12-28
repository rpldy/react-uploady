// @flow
import { FILE_STATES, logger } from "@rpldy/shared";
import processBatchItems from "./processBatchItems";
import {
    getBatchDataFromItemId,
    getIsItemBatchReady,
    isNewBatchStarting,
    cancelBatchForItem,
    loadNewBatchForItem,
    failBatchForItem,
} from "./batchHelpers";
import { isItemBelongsToBatch } from "./itemHelpers";

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

export const findNextItemIndex = (queue: QueueState): number => {
    const state = queue.getState(),
        itemQueue = state.itemQueue,
        items = state.items;
    let index = 0,
        nextId = itemQueue[index];

    //find item that isnt already in an active request and belongs to a "ready" batch
    while (nextId && (getIsItemInActiveRequest(queue, nextId) ||
        !getIsItemBatchReady(queue, nextId) ||
        !getIsItemReady(items[nextId]))) {
        index += 1;
        nextId = itemQueue[index];
    }

    return nextId ? index : -1;
};

export const getNextIdGroup = (queue: QueueState): ?string[] => {
    const itemQueue = queue.getState().itemQueue;
    const nextItemIndex = findNextItemIndex(queue);
    let nextId = itemQueue[nextItemIndex],
        nextGroup;

    if (nextId) {
        const batchData = getBatchDataFromItemId(queue, nextId);

        const batchId = batchData.batch.id,
            groupMax = batchData.batchOptions.maxGroupSize || 0;

        if (batchData.batchOptions.grouped && groupMax > 1) {
            nextGroup = [];
            let nextBelongsToSameBatch = true;

            //dont group files from different batches
            while (nextGroup.length < groupMax && nextBelongsToSameBatch) {
                nextGroup.push(nextId);
                nextId = itemQueue[nextItemIndex + nextGroup.length];
                nextBelongsToSameBatch = nextId &&
                    isItemBelongsToBatch(queue, nextId, batchId);
            }
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
