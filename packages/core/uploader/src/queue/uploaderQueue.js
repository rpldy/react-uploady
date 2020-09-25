// @flow
import { logger, hasWindow } from "@rpldy/shared";
import createState, { unwrap } from "@rpldy/simple-state";
import { SENDER_EVENTS, UPLOADER_EVENTS } from "../consts";
import processQueueNext from "./processQueueNext";
import * as abortMethods from "./abort";
import { detachRecycledFromPreviousBatch } from "./batchHelpers";

import type { Cancellable, Batch, BatchItem } from "@rpldy/shared";
import type { TriggerMethod } from "@rpldy/life-events";
import type { ItemsSender, CreateOptions } from "../types";
import type { State } from "./types";

const createUploaderQueue = (
    options: CreateOptions,
    cancellable: Cancellable,
    trigger: TriggerMethod,
    sender: ItemsSender,
    uploaderId: string,
) => {
    const { state, update } = createState<State>({
        itemQueue: [],
        currentBatch: null,
        batches: {},
        items: {},
        activeIds: [],
        aborts: {},
    });

    const unWrapAndTrigger = (name: string, ...data: mixed[]) =>
        trigger(name, ...data.map((d) => unwrap(d)));

    const unWrapAndCancellable = (name: string, ...data: mixed[]) =>
        cancellable(name, ...data.map((d) => unwrap(d)));

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
            state.itemQueue.push(item.id);
        });
    };

    const uploadBatch = (batch: Batch) => {
        batch.items.forEach(add);

        processQueueNext(queueState);
    };

    const addBatch = (batch: Batch, batchOptions: CreateOptions) => {
        updateState((state) => {
            state.batches[batch.id] = { batch, batchOptions };
        });
    };

    const handleItemProgress = (item: BatchItem, completed: number, loaded: number) => {
        if (state.items[item.id]) {
            updateState((state: State) => {
                const stateItem = state.items[item.id];
                stateItem.loaded = loaded;
                stateItem.completed = completed;
            });

            //trigger item progress event for the outside
            unWrapAndTrigger(UPLOADER_EVENTS.ITEM_PROGRESS, getState().items[item.id]);
        }
    };

    sender.on(SENDER_EVENTS.ITEM_PROGRESS, handleItemProgress);

    sender.on(SENDER_EVENTS.BATCH_PROGRESS,
        (batch: Batch) => {
            const batchItems = state
                .batches[batch.id]?.batch
                .items;

            if (batchItems) {
                const [completed, loaded] = batchItems
                    .reduce((res, item) => {
                        res[0] += item.completed;
                        res[1] += item.loaded;
                        return res;
                    }, [0, 0]);

                updateState((state: State) => {
                    const stateBatch = state.batches[batch.id].batch;
                    //average of completed percentage for batch items
                    stateBatch.completed = completed / batchItems.length;
                    //sum of loaded bytes for batch items
                    stateBatch.loaded = loaded;
                });

                unWrapAndTrigger(UPLOADER_EVENTS.BATCH_PROGRESS, state.batches[batch.id].batch);
            }
        });

    const queueState = {
        getOptions: () => options,
        getCurrentActiveCount: () => state.activeIds.length,
        getState,
        updateState,
        trigger: unWrapAndTrigger,
        cancellable: unWrapAndCancellable,
        sender,
        handleItemProgress,
    };

    if (hasWindow && logger.isDebugOn()) {
        window[`__rpldy_${uploaderId}_queue_state`] = queueState;
    }

    const abortItem = (id: string) => {
        return abortMethods.abortItem(queueState, id, processQueueNext);
    };

    const abortBatch = (id: string) => {
        abortMethods.abortBatch(queueState, id, processQueueNext);
    };

    const abortAll = () => {
        abortMethods.abortAll(queueState, processQueueNext);
    };

    return {
        updateState,
        getState: queueState.getState,
        uploadBatch,
        addBatch,
        abortItem,
        abortBatch,
        abortAll,
    };
};

export default createUploaderQueue;
