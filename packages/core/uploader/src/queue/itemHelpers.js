// @flow
import type { QueueState } from "./types";

const finalizeItem = (queue: QueueState, id: string, delItem: boolean = false) => {
    queue.updateState((state) => {
        const { batchId } = state.items[id] || {};

        if (delItem) {
            delete state.items[id];
        }

        const index = batchId ? state.itemQueue[batchId].indexOf(id) : -1;

        if (~index) {
            state.itemQueue[batchId].splice(index, 1);
        }

        const activeIndex = state.activeIds.indexOf(id);

        if (~activeIndex) {
            state.activeIds.splice(activeIndex, 1);
        }
    });
};

// const isItemBelongsToBatch = (queue: QueueState, itemId: string, batchId: string): boolean =>
//     queue.getState()
//         .items[itemId].batchId === batchId;

const getIsItemExists = (queue: QueueState, itemId: string): boolean =>
    !!queue.getState().items[itemId];

export {
    finalizeItem,
    // isItemBelongsToBatch,
    getIsItemExists,
};
