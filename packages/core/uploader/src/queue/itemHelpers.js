// @flow
import type { QueueState } from "./types";

const finalizeItem = (queue: QueueState, id: string, delItem: boolean = false) => {
    const state = queue.getState();
    const index = state.itemQueue.indexOf(id);

    if (~index) {
        queue.updateState((state) => {
            if (delItem) {
                delete state.items[id];
            }

            state.itemQueue.splice(index, 1);
            const activeIndex = state.activeIds.indexOf(id);

            if (~activeIndex) {
                state.activeIds.splice(activeIndex, 1);
            }
        });
    }
};

const isItemBelongsToBatch = (queue: QueueState, itemId: string, batchId: string): boolean =>
    queue.getState()
        .items[itemId].batchId === batchId;

export {
    finalizeItem,
    isItemBelongsToBatch,
};
