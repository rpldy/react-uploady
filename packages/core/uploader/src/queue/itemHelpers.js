// @flow
import { ITEM_FINALIZE_STATES } from "../consts";

import type { BatchItem } from "@rpldy/shared";
import type { QueueState } from "./types";

const finalizeItem = (queue: QueueState, id: string, delItem: boolean = false) => {
    queue.updateState((state) => {
        const { batchId } = state.items[id] || { batchId: null };

        if (delItem) {
            delete state.items[id];
        }

        const index = batchId ? state.itemQueue[batchId].indexOf(id) : -1;

        if (~index && batchId) {
            state.itemQueue[batchId].splice(index, 1);
        }

        const activeIndex = state.activeIds.indexOf(id);

        if (~activeIndex) {
            state.activeIds.splice(activeIndex, 1);
        }
    });
};

const getIsItemExists = (queue: QueueState, itemId: string): boolean =>
    !!queue.getState().items[itemId];

const getIsItemFinalized = (item: BatchItem): boolean =>
    ITEM_FINALIZE_STATES.includes(item.state);

export {
    finalizeItem,
    getIsItemExists,
    getIsItemFinalized,
};
