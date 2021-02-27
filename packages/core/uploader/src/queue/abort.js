// @flow
import { BATCH_STATES, FILE_STATES, logger } from "@rpldy/shared";
import { UPLOADER_EVENTS } from "../consts";
import {
    triggerUploaderBatchEvent,
    getBatchFromState,
    getIsBatchFinalized,
} from "./batchHelpers";
import processFinishedRequest from "./processFinishedRequest";

import type { BatchItem } from "@rpldy/shared";
import type { ProcessNextMethod, QueueState } from "./types";

const abortNonUploadingItem = (queue, item: BatchItem, next) => {
    logger.debugLog(`uploader.queue: aborting ${item.state} item  - `, item);

    //manually finish request for item that hasnt reached the sender yet
    processFinishedRequest(queue, [{
        id: item.id,
        info: { status: 0, state: FILE_STATES.ABORTED, response: "aborted" },
    }], next);

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

const callAbortOnItem = (queue: QueueState, id: string, next: ProcessNextMethod) => {
    const state = queue.getState(),
        item = state.items[id],
        itemState = item?.state;

    return ITEM_STATE_ABORTS[itemState] ?
        ITEM_STATE_ABORTS[itemState](queue, item, next) : false;
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

	if (batch && !getIsBatchFinalized(batch)) {
        queue.updateState((state) => {
            getBatchFromState(state, id).state = BATCH_STATES.ABORTED;
        });

        triggerUploaderBatchEvent(queue, id, UPLOADER_EVENTS.BATCH_ABORT);

        batch.items.forEach((bi) =>
            callAbortOnItem(queue, bi.id, next));
	}
};

export {
	abortAll,
	abortItem,
	abortBatch,
};
