// @flow
import { BATCH_STATES, logger } from "@rpldy/shared";
import { UPLOADER_EVENTS } from "../consts";

import type { BatchItem } from "@rpldy/shared";
import type { QueueState } from "./types";

const callAbortOnItem = (item: BatchItem) => {
	logger.debugLog("uploader.abort: about to abort item: ", item);
	return item.abort();
};

const abortAll = (queue: QueueState) => {
	const items = queue.getState().items;
	Object.keys(items)
		.forEach((id) => callAbortOnItem(items[id]));
};

const abortItem = (queue: QueueState, id: string): boolean => {
	let aborted = false;

	const state = queue.getState(),
		item = state.items[id];

	if (item) {
		aborted = callAbortOnItem(item);
	}

	return aborted;
};

const abortBatch = (queue: QueueState, id: string) => {
	const batchData = queue.getState().batches[id],
		batch = batchData.batch;

	if (batch && batch.state !== BATCH_STATES.CANCELLED
		&& batch.state !== BATCH_STATES.FINISHED) {

		batch.items
			.forEach(callAbortOnItem);

		queue.trigger(UPLOADER_EVENTS.BATCH_ABORT, batch);
	}
};

export {
	abortAll,
	abortItem,
	abortBatch,
};