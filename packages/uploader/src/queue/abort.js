// @flow
import { BATCH_STATES, FILE_STATES, logger } from "@rpldy/shared";
import { UPLOADER_EVENTS } from "../consts";
import { triggerUploaderBatchEvent, getBatchFromState } from "./batchHelpers";

import type { QueueState } from "./types";
import type { FileState } from "@rpldy/shared";

const isItemInProgress = (state: FileState): boolean =>
	state === FILE_STATES.ADDED ||
	state === FILE_STATES.UPLOADING;

const callAbortOnItem = (queue: QueueState, id: string) => {
	let abortCalled = false;

	const state = queue.getState(),
		item = state.items[id];

	if (item && isItemInProgress(item.state)) {
		logger.debugLog(`uploader.queue: aborting item in progress - `, item);

		if (item.state === FILE_STATES.UPLOADING) {
			abortCalled = state.aborts[id]();
		} else {
			abortCalled = true;
		}

		queue.updateState((state) => {
			state.items[id].state = FILE_STATES.ABORTED;
			delete state.aborts[id];
		});
	}

	return abortCalled;
};

const abortAll = (queue: QueueState) => {
	const items = queue.getState().items;

	Object.keys(items)
		.forEach((id) => callAbortOnItem(queue, id));
};

const abortItem = (queue: QueueState, id: string): boolean => {
	return callAbortOnItem(queue, id);
};

const abortBatch = (queue: QueueState, id: string): void => {
	const state = queue.getState(),
		batchData = state.batches[id],
		batch = batchData?.batch;

	if (batch && batch.state !== BATCH_STATES.CANCELLED
		&& batch.state !== BATCH_STATES.FINISHED) {

		batch.items.forEach((bi) =>
			//using state items because batch items are different due to immer
			callAbortOnItem(queue, bi.id));

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