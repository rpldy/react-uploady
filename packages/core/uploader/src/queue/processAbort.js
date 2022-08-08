// @flow
import { BATCH_STATES, invariant } from "@rpldy/shared";
import { UPLOADER_EVENTS } from "../consts";
import processFinishedRequest from "./processFinishedRequest";
import processQueueNext from "./processQueueNext";
import { getBatchFromState, getIsBatchFinalized, finalizeBatch } from "./batchHelpers";

import type { UploadData } from "@rpldy/shared";
import type { QueueState } from "./types";

const getFinalizeAbortedItem = (queue) =>  (id: string, data: UploadData) =>
    processFinishedRequest(queue, [{ id, info: data }], processQueueNext);

const processAbortItem = (queue: QueueState, id: string): boolean => {
    const abortItemMethod = queue.getOptions().abortItem;

    invariant(
        !!abortItemMethod,
        "Abort Item method not provided yet abortItem was called"
    );

    const state = queue.getState();

    return abortItemMethod(id, state.items, state.aborts, getFinalizeAbortedItem(queue));
};

const processAbortBatch = (queue: QueueState, id: string): void => {
    const abortBatchMethod = queue.getOptions().abortBatch;

    invariant(
        !!abortBatchMethod,
        "Abort Batch method not provided yet abortItem was called"
    );

    const state = queue.getState(),
        batchData = state.batches[id],
		batch = batchData?.batch;

    if (batch && !getIsBatchFinalized(batch)) {
        queue.updateState((state) => {
            getBatchFromState(state, id).state = BATCH_STATES.ABORTED;
        });

        finalizeBatch(queue, id, UPLOADER_EVENTS.BATCH_ABORT);

        const { isFast } = abortBatchMethod(
            batch,
            batchData.batchOptions,
            state.aborts,
            getFinalizeAbortedItem(queue),
            queue.getOptions()
        );

        if (isFast) {
            queue.clearBatchUploads(batch.id);
        }
    }
};
// const abortBatch = (queue: QueueState, id: string, next: ProcessNextMethod): void => {
// 	const state = queue.getState(),
// 		batchData = state.batches[id],
// 		batch = batchData?.batch;
//
// 	if (batch && !getIsBatchFinalized(batch)) {
//         queue.updateState((state) => {
//             getBatchFromState(state, id).state = BATCH_STATES.ABORTED;
//         });
//
//         triggerUploaderBatchEvent(queue, id, UPLOADER_EVENTS.BATCH_ABORT);
//
//         batch.items.forEach((bi) =>
//             callAbortOnItem(queue, bi.id, next));
// 	}
// };

const processAbortAll = (queue: QueueState): void => {
    const abortAllMethod = queue.getOptions().abortAll;

    invariant(
        !!abortAllMethod,
        "Abort All method not provided yet abortAll was called"
    );

    queue.trigger(UPLOADER_EVENTS.ALL_ABORT);

    const state = queue.getState();

    const { isFast } = abortAllMethod(
        state.items,
        state.aborts,
        getFinalizeAbortedItem(queue),
        queue.getOptions()
    );

    if (isFast) {
        queue.clearAllUploads();
    }
};

export {
    processAbortItem,
    processAbortBatch,
    processAbortAll,
};
