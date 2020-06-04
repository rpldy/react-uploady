// @flow
import { BATCH_STATES, FILE_STATES, logger } from "@rpldy/shared";
import { UPLOADER_EVENTS } from "../consts";
import { triggerUploaderBatchEvent, getBatchFromState } from "./batchHelpers";
import processFinishedRequest from "./processFinishedRequest";

import type { ProcessNextMethod, QueueState } from "./types";
import type { FileState } from "@rpldy/shared";

const isItemInProgress = (state: FileState): boolean =>
	state === FILE_STATES.ADDED ||
	state === FILE_STATES.UPLOADING;

const callAbortOnItem = (queue: QueueState, id: string, next: ProcessNextMethod) => {
	let abortCalled = false;

	const state = queue.getState(),
		item = state.items[id];

	if (item && isItemInProgress(item.state)) {
		logger.debugLog(`uploader.queue: aborting item in progress - `, item);

		if (item.state === FILE_STATES.UPLOADING) {
			queue.updateState((state) => {
				state.items[id].state = FILE_STATES.ABORTED;
			});

			abortCalled = state.aborts[id]();
		} else {
			//manually finish request for added item that hasnt reached the sender yet
			processFinishedRequest(queue, [{
				id,
				info: { status: 0, state: FILE_STATES.ABORTED, response: "aborted" },
			}], next);

			abortCalled = true;
		}
	}

	return abortCalled;
};

const abortAll = (queue: QueueState, next: ProcessNextMethod) => {
	const items = queue.getState().items;

	Object.keys(items)
		.forEach((id) => callAbortOnItem(queue, id, next));
};

const abortItem = (queue: QueueState, id: string, next: ProcessNextMethod): boolean => {
	return callAbortOnItem(queue, id, next);
};

const abortBatch = (queue: QueueState, id: string, next: ProcessNextMethod): void => {
	const state = queue.getState(),
		batchData = state.batches[id],
		batch = batchData?.batch;

	if (batch && batch.state !== BATCH_STATES.CANCELLED
		&& batch.state !== BATCH_STATES.FINISHED) {

		batch.items.forEach((bi) =>
			callAbortOnItem(queue, bi.id, next));

		queue.updateState((state) => {
			getBatchFromState(state, id).state = BATCH_STATES.ABORTED;
		});

		triggerUploaderBatchEvent(queue, id, UPLOADER_EVENTS.BATCH_ABORT);
	}
};

export {
	abortAll,
	abortItem,
	abortBatch,
};
