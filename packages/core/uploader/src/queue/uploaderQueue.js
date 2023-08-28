// @flow
import { logger, hasWindow, isFunction, scheduleIdleWork } from "@rpldy/shared";
import createState from "@rpldy/simple-state";
import { SENDER_EVENTS, UPLOADER_EVENTS } from "../consts";
import processQueueNext from "./processQueueNext";
import { processAbortItem, processAbortBatch, processAbortAll } from "./processAbort";
import {
    detachRecycledFromPreviousBatch,
    getBatchFromState,
    preparePendingForUpload,
    removePendingBatches,
    clearBatchData,
    cancelBatchWithId,
} from "./batchHelpers";

import type { TriggerCancellableOutcome, Batch, BatchItem, UploadOptions } from "@rpldy/shared";
import type { TriggerMethod } from "@rpldy/life-events";
import type { ItemsSender, UploaderCreateOptions } from "../types";
import type { State, UploaderQueue } from "./types";

const createUploaderQueue = (
    options: UploaderCreateOptions,
    trigger: TriggerMethod,
    cancellable: TriggerCancellableOutcome,
    sender: ItemsSender,
    uploaderId: string,
) : UploaderQueue => {
    const { state, update } = createState<State>({
        itemQueue: { },
        batchQueue: [],
        currentBatch: null,
        batchesStartPending: [],
        batches: {},
        items: {},
        activeIds: [],
        aborts: {},
    });

    const getState = () => state;

    const updateState = (updater: (State) => void) => {
        update(updater);
    };

    const add = (item: BatchItem) => {
        if (state.items[item.id] && !item.recycled) {
            throw new Error(`Uploader queue conflict - item ${item.id} already exists`);
        }

        if (item.recycled) {
            detachRecycledFromPreviousBatch(queueState, item);
        }

        updateState((state) => {
            state.items[item.id] = item;
        });
    };

    const uploadBatch = (batch: Batch, batchOptions: ?UploaderCreateOptions) => {
        if (batchOptions) {
            updateState((state) => {
                state.batches[batch.id].batchOptions = batchOptions;
            });
        }

        processQueueNext(queueState);
    };

    const uploadPendingBatches = (uploadOptions: ?UploadOptions) => {
        preparePendingForUpload(queueState, uploadOptions);
        processQueueNext(queueState);
    };

    const addBatch = (batch: Batch, batchOptions: UploaderCreateOptions) => {
        updateState((state) => {
            state.batches[batch.id] = { batch, batchOptions, finishedCounter: 0 };
            state.batchQueue.push(batch.id);
            state.itemQueue[batch.id] = batch.items.map(({ id }) => id);
        });

        batch.items.forEach(add);

        return getBatchFromState(state, batch.id);
    };

    const handleItemProgress = (item: BatchItem, completed: number, loaded: number, total: number) => {
        if (state.items[item.id]) {
            updateState((state: State) => {
                const stateItem = state.items[item.id];
                stateItem.loaded = loaded;
                stateItem.completed = completed;
                stateItem.total = total;
            });

            //trigger item progress event for the outside
            trigger(UPLOADER_EVENTS.ITEM_PROGRESS, getState().items[item.id]);
        }
    };

    const handleBatchProgress = (batch: Batch) => {
        const batchItems = state
            .batches[batch.id]?.batch
            .items;

        if (batchItems) {
            const [completed, loaded] = batchItems
                .reduce((res, { id }) => {
                    //getting data from state.items since in dev the wrapped state.batch.items and state.items aren't the same objects
                    const { completed, loaded } = state.items[id];
                    res[0] += completed;
                    res[1] += loaded;
                    return res;
                }, [0, 0]);

            updateState((state: State) => {
                const stateBatch = state.batches[batch.id].batch;
                //average of completed percentage for batch items
                stateBatch.completed = completed / batchItems.length;
                //sum of loaded bytes for batch items
                stateBatch.loaded = loaded;
            });

            trigger(UPLOADER_EVENTS.BATCH_PROGRESS, state.batches[batch.id].batch);
        }
    };

    sender.on(SENDER_EVENTS.ITEM_PROGRESS, handleItemProgress);

    sender.on(SENDER_EVENTS.BATCH_PROGRESS, handleBatchProgress);

    const runCancellable = (name: string, ...args: mixed[]) => {
        if (!isFunction(cancellable)) {
            //for flow :(
            throw new Error("Uploader queue - cancellable is of wrong type");
        }

        return cancellable(name, ...args);
    };

    /**
     * Force clear all items from queue's state.
     * Use with caution!
     */
    const clearAllUploads = () => {
        queueState.updateState((state: State) => {
            state.itemQueue = { };
            state.batchQueue = [];
            state.currentBatch = null;
            state.batches = {};
            state.items = {};
            state.activeIds = [];
        });
    };

    /**
     * Force clear all batch items from queue's state.
     * Use with caution!
     */
    const clearBatchUploads = (batchId: string) => {
        scheduleIdleWork(() => {
            logger.debugLog(`uploader.queue: started scheduled work to clear batch uploads (${batchId})`);

            if (getState().batches[batchId]) {
                clearBatchData(queueState, batchId);
            }
        });
    };

    const queueState = {
        uploaderId,
        getOptions: () => options,
        getCurrentActiveCount: () => state.activeIds.length,
        getState,
        updateState,
        trigger,
        runCancellable,
        sender,
        handleItemProgress,
        clearAllUploads,
        clearBatchUploads,
    };

    if (hasWindow() && logger.isDebugOn()) {
        window[`__rpldy_${uploaderId}_queue_state`] = queueState;
    }

    const clearPendingBatches = () => {
        removePendingBatches(queueState);
    };

    const cancelBatch = (batch: Batch) =>
        cancelBatchWithId(queueState, batch.id);

    return {
        updateState,
        getState: queueState.getState,
        runCancellable: queueState.runCancellable,
        uploadBatch,
        addBatch,
        abortItem: (...args: string[]) => processAbortItem(queueState, ...args),
        abortBatch: (...args: string[]) => processAbortBatch(queueState, ...args),
        abortAll: (...args: string[]) => processAbortAll(queueState, ...args),
        clearPendingBatches,
        uploadPendingBatches,
        cancelBatch,
    };
};

export default createUploaderQueue;
