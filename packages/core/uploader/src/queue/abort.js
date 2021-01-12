// @flow
import { BATCH_STATES, FILE_STATES, logger } from "@rpldy/shared";
import { UPLOADER_EVENTS } from "../consts";
import {
    triggerUploaderBatchEvent,
    getBatchFromState,
    ensureNonUploadingBatchCleaned,
} from "./batchHelpers";
import processFinishedRequest from "./processFinishedRequest";

import type { BatchItem } from "@rpldy/shared";
import type { ProcessNextMethod, QueueState } from "./types";

const getIsAbortableBatch = (batch: Batch): boolean =>
    batch.state !== BATCH_STATES.CANCELLED &&
    batch.state !== BATCH_STATES.FINISHED;

const abortNonUploadingItem = (queue, item: BatchItem, next, batchAbort) => {
    logger.debugLog(`uploader.queue: aborting ${item.state} item  - `, item);

    //manually finish request for item that hasnt reached the sender yet
    processFinishedRequest(queue, [{
        id: item.id,
        info: { status: 0, state: FILE_STATES.ABORTED, response: "aborted" },
    }], next);

    if (!batchAbort) {
        ensureNonUploadingBatchCleaned(queue, item.batchId);
    }

    return true;
};

const ITEM_STATE_ABORTS = {
    [FILE_STATES.UPLOADING]: (queue, item) => {
        logger.debugLog(`uploader.queue: aborting uploading item  - `, item);
        return queue.getState().aborts[item.id]();
    },
    [FILE_STATES.ADDED]: abortNonUploadingItem,
    [FILE_STATES.PENDING]: abortNonUploadingItem,
};

const callAbortOnItem = (queue: QueueState, id: string, next: ProcessNextMethod, batchAbort = false) => {
    const state = queue.getState(),
        item = state.items[id];

    return ITEM_STATE_ABORTS[item?.state] ?
        ITEM_STATE_ABORTS[item.state](queue, item, next, batchAbort) : false;
};

const abortAll = (queue: QueueState, next: ProcessNextMethod) => {
	const items = queue.getState().items;

	Object.keys(items)
		.forEach((id) => callAbortOnItem(queue, id, next));

	queue.trigger(UPLOADER_EVENTS.ALL_ABORT);
};

const abortItem = (queue: QueueState, id: string, next: ProcessNextMethod): boolean =>
    callAbortOnItem(queue, id, next);

const abortBatch = (queue: QueueState, id: string, next: ProcessNextMethod): void => {
	const state = queue.getState(),
		batchData = state.batches[id],
		batch = batchData?.batch;

	if (batch && getIsAbortableBatch(batch)) {
        batch.items.forEach((bi) =>
            callAbortOnItem(queue, bi.id, next, true));

        queue.updateState((state) => {
            getBatchFromState(state, id).state = BATCH_STATES.ABORTED;
        });

        triggerUploaderBatchEvent(queue, id, UPLOADER_EVENTS.BATCH_ABORT);

        ensureNonUploadingBatchCleaned(queue, batch.id);
	}
};

export {
	abortAll,
	abortItem,
	abortBatch,
};
