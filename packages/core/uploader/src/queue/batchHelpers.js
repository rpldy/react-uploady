// @flow
import { BATCH_STATES, logger, merge, FILE_STATES, scheduleIdleWork } from "@rpldy/shared";
import { unwrap } from "@rpldy/simple-state";
import { UPLOADER_EVENTS } from "../consts";
import { getItemsPrepareUpdater } from "./preSendPrepare";
import { finalizeItem, getIsItemExists } from "./itemHelpers";

import type { BatchData, QueueState, State } from "./types";
import type { Batch, BatchItem, UploadOptions } from "@rpldy/shared";
import type { ItemsSendData } from "./preSendPrepare";

const prepareBatchStartItems = getItemsPrepareUpdater<Batch>(
    UPLOADER_EVENTS.BATCH_START,
    (batch: Batch): BatchItem[] => batch.items,
    null,
    ({ batch } = { batch: false }) => {
        if (batch)  {
            throw new Error(`BATCH_START event handlers cannot update batch data. Only items & options`);
        }
    },
);

const BATCH_READY_STATES = [
    BATCH_STATES.ADDED,
    BATCH_STATES.PROCESSING,
    BATCH_STATES.UPLOADING,
];

const BATCH_FINISHED_STATES = [
    BATCH_STATES.ABORTED,
    BATCH_STATES.CANCELLED,
    BATCH_STATES.FINISHED,
    BATCH_STATES.ERROR,
];

const getBatchFromState = (state: State, id: string): Batch =>
    state.batches[id].batch;

const getBatch = (queue: QueueState, id: string): Batch => {
    return getBatchFromState(queue.getState(), id);
};

const getBatchDataFromItemId = (queue: QueueState, itemId: string): BatchData => {
    const state = queue.getState();
    const item = state.items[itemId];
    return state.batches[item.batchId];
};

const getBatchFromItemId = (queue: QueueState, itemId: string): Batch => {
    return getBatchDataFromItemId(queue, itemId).batch;
};

const removeBatchItems = (queue: QueueState, batchId: string) => {
    const batch = getBatch(queue, batchId);

    batch.items.forEach(({ id }: BatchItem) =>
        finalizeItem(queue, id, true));
};

const removeBatch = (queue: QueueState, batchId: string) => {
    queue.updateState((state) => {
        delete state.batches[batchId];
        delete state.itemQueue[batchId];

        const batchQueueIndex = state.batchQueue.indexOf(batchId);

        if (~batchQueueIndex) {
            state.batchQueue.splice(batchQueueIndex, 1);
        }

        const pendingFlagIndex = state.batchesStartPending.indexOf(batchId);

        if (~pendingFlagIndex) {
            state.batchesStartPending.splice(pendingFlagIndex, 1);
        }
    });
};

const finalizeBatch = (
    queue: QueueState,
    batchId: string,
    eventType: string,
    finalState: string = BATCH_STATES.FINISHED,
    additionalInfo?: string,
): void => {
    queue.updateState((state) => {
        const batch = getBatchFromState(state, batchId);
        batch.state = finalState;

        if (additionalInfo) {
            batch.additionalInfo = additionalInfo;
        }
    });

    triggerUploaderBatchEvent(queue, batchId, eventType);
    triggerUploaderBatchEvent(queue, batchId, UPLOADER_EVENTS.BATCH_FINALIZE);
};

const cancelBatchWithId = (queue: QueueState, batchId: string) => {
    logger.debugLog("uploady.uploader.batchHelpers: cancelling batch: ", batchId);

    finalizeBatch(queue, batchId, UPLOADER_EVENTS.BATCH_CANCEL, BATCH_STATES.CANCELLED);
    removeBatchItems(queue, batchId);
    removeBatch(queue, batchId);
};

const cancelBatchForItem = (queue: QueueState, itemId: string) => {
    if (getIsItemExists(queue, itemId)) {
        const data = getBatchDataFromItemId(queue, itemId),
            batchId = data?.batch.id;

        //in case batch is aborted while async batch-start is pending we can reach here after batch was already removed
        if (batchId) {
            cancelBatchWithId(queue, batchId);
        } else {
            logger.debugLog(`uploady.uploader.batchHelpers: cancel batch called for batch already removed (item id = ${itemId})`);
        }
    }
};

const failBatchForItem = (queue: QueueState, itemId: string, err: Error) => {
    const batch = getBatchFromItemId(queue, itemId),
        batchId = batch.id;

    logger.debugLog("uploady.uploader.batchHelpers: failing batch: ", { batch });

    finalizeBatch(queue, batchId, UPLOADER_EVENTS.BATCH_ERROR, BATCH_STATES.ERROR, err.message);
    removeBatchItems(queue, batchId);
    removeBatch(queue, batchId);
};

const isItemBatchStartPending = (queue: QueueState, itemId: string): boolean => {
    const batch = getBatchFromItemId(queue, itemId);
    return queue.getState().batchesStartPending.includes(batch.id);
};

const isNewBatchStarting = (queue: QueueState, itemId: string): boolean => {
    const batch = getBatchFromItemId(queue, itemId);
    return queue.getState().currentBatch !== batch.id;
};

const loadNewBatchForItem = (queue: QueueState, itemId: string): Promise<boolean> => {
    const batch = getBatchFromItemId(queue, itemId);

    queue.updateState((state) => {
        //storing pending flag as for batch with async start handler an item can be aborted and we'll get here AGAIN before start handler returned
        state.batchesStartPending.push(batch.id);
    });

    return prepareBatchStartItems(queue, batch)
        .then(({ cancelled }: ItemsSendData) => {
            let alreadyFinished = false;

            queue.updateState((state) => {
                const pendingFlagIndex = state.batchesStartPending.indexOf(batch.id);
                state.batchesStartPending.splice(pendingFlagIndex, 1);
            });

            if (!cancelled) {
                //in case of async batch start, its possible that when batch is aborted, items are already removed from queue
                alreadyFinished = !getIsItemExists(queue, itemId);

                if (!alreadyFinished) {
                    queue.updateState((state) => {
                        state.currentBatch = batch.id;
                    });
                }
            }

            return !cancelled && !alreadyFinished;
        });
};

const cleanUpFinishedBatches = (queue: QueueState) => {
    scheduleIdleWork(() => {
        const state = queue.getState();

        Object.keys(state.batches)
            .forEach((batchId) => {
                const { batch, finishedCounter } = state.batches[batchId];
                const { orgItemCount } = batch;

                //shouldnt be the case, but if wasnt cleaned before, it will now
                const alreadyFinalized = getIsBatchFinalized(batch);

                if (orgItemCount === finishedCounter) {
                    //batch may not be updated with completed/loaded with 100% values
                    if (!alreadyFinalized && batch.completed !== 100) {
                        queue.updateState((state: State) => {
                            const batch: Batch = getBatchFromState(state, batchId);
                            batch.completed = 100;
                            batch.loaded = batch.items.reduce((res, { loaded }) => res + loaded, 0);
                        });

                        //ensure we trigger progress event with completed = 100 for all items
                        triggerUploaderBatchEvent(queue, batchId, UPLOADER_EVENTS.BATCH_PROGRESS);
                    }

                    queue.updateState((state: State) => {
                        if (state.currentBatch === batchId) {
                            state.currentBatch = null;
                        }
                    });

                    logger.debugLog(`uploady.uploader.batchHelpers: cleaning up batch: ${batch.id}`);

                    if (!alreadyFinalized) {
                        finalizeBatch(queue, batchId, UPLOADER_EVENTS.BATCH_FINISH);
                    }

                    removeBatchItems(queue, batchId);
                    removeBatch(queue, batchId);
                }
            });
    });

};

const triggerUploaderBatchEvent = (queue: QueueState, batchId: string, event: string) => {
    const state = queue.getState(),
        { batch, batchOptions } = state.batches[batchId], //get the most up-to-date batch data
        stateItems = state.items;

    const eventBatch = {
        ...unwrap(batch),
        items: batch.items.map(({ id }: BatchItem) => unwrap(stateItems[id])),
    };

    queue.trigger(event, eventBatch, unwrap(batchOptions));
};

const getIsBatchReady = (queue: QueueState, batchId: string): boolean => {
    const batch = getBatchFromState(queue.getState(), batchId);
    return BATCH_READY_STATES.includes(batch.state);
};

const detachRecycledFromPreviousBatch = (queue: QueueState, item: BatchItem): void => {
    const { previousBatch } = item;

    if (item.recycled && previousBatch &&
        queue.getState().batches[previousBatch]) {
        const { id: batchId } = getBatchFromItemId(queue, item.id);

        if (batchId === previousBatch) {
            queue.updateState((state: State) => {
                const batch = getBatchFromState(state, batchId);
                const index = batch.items.findIndex(({ id }: BatchItem) => id === item.id);

                if (~index) {
                    batch.items.splice(index, 1);
                }

                if (state.batches[batchId].itemBatchOptions[item.id]) {
                    delete state.batches[batchId].itemBatchOptions[item.id];
                }
            });
        }
    }
};

const preparePendingForUpload = (queue: QueueState,  uploadOptions: ?UploadOptions): void => {
    queue.updateState((state) => {
        //remove pending state from pending batches
        Object.keys(state.batches)
            .forEach((batchId: string) => {
                const batchData = state.batches[batchId];
                const { batch, batchOptions } = batchData;

                if (batch.state === BATCH_STATES.PENDING) {
                    batch.items.forEach((item: BatchItem) => {
                        item.state = FILE_STATES.ADDED;
                    });

                    batch.state = BATCH_STATES.ADDED;

                    batchData.batchOptions = merge({}, batchOptions, uploadOptions);
                }
            });
    });
};

const removePendingBatches = (queue: QueueState): void => {
    const batches = queue.getState().batches;

    Object.keys(batches)
        .filter((batchId: string) =>
            batches[batchId].batch.state === BATCH_STATES.PENDING)
        .forEach((batchId: string) => {
            removeBatchItems(queue, batchId);
            removeBatch(queue, batchId);
        });
};

const incrementBatchFinishedCounter = (queue: QueueState, batchId: string): void => {
    queue.updateState((state: State) => {
        state.batches[batchId].finishedCounter +=1;
    });
};

const getIsBatchFinalized = (batch: Batch): boolean =>
    BATCH_FINISHED_STATES.includes(batch.state);

/**
 * As this is a data-destructive method it is meant
 * to be used with fast-abort ONLY. Not for any regular operation
 */
const clearBatchData = (queue: QueueState, batchId: string) => {
    queue.updateState((state: State) => {
        const { items } = getBatchFromState(state, batchId);

        delete state.batches[batchId];
        delete state.itemQueue[batchId];

        const indx = state.batchQueue.indexOf(batchId);

        if (~indx) {
            state.batchQueue.splice(indx, 1);
        }

        if (state.currentBatch === batchId) {
            state.currentBatch = null;
        }

        items.forEach(({ id }) => {
            delete state.items[id];

            const activeIndex = state.activeIds.indexOf(id);

            if (~activeIndex) {
                state.activeIds.splice(activeIndex, 1);
            }
        });
    });
};

export {
    loadNewBatchForItem,
    isNewBatchStarting,
    cancelBatchWithId,
    cancelBatchForItem,
    getBatchFromItemId,
    getBatchDataFromItemId,
    cleanUpFinishedBatches,
    triggerUploaderBatchEvent,
    getIsBatchReady,
    getBatchFromState,
    detachRecycledFromPreviousBatch,
    preparePendingForUpload,
    removePendingBatches,
    incrementBatchFinishedCounter,
    getIsBatchFinalized,
    failBatchForItem,
    finalizeBatch,
    removeBatchItems,
    clearBatchData,
    isItemBatchStartPending,
};
