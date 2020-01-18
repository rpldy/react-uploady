// @flow
import { BATCH_STATES, logger } from "@rpldy/shared";
import { UPLOADER_EVENTS } from "../consts";
import { triggerUploaderBatchEvent } from "./batchHelpers";

import type { QueueState, State } from "./types";

const callAbortOnItem = (state: State, id: string) => {
	logger.debugLog("uploader.abort: about to abort item: ", id);
	const item = state.items[id];
	return item ? item.abort() : false;
};

const abortAll = (queue: QueueState) => {
	const state = queue.getState(),
		items = state.items;

	Object.keys(items)
		.forEach((id) => callAbortOnItem(state, id));
};

const abortItem = (queue: QueueState, id: string): boolean => {
	return callAbortOnItem(queue.getState(), id);
};

const abortBatch = (queue: QueueState, id: string): void => {
	const state = queue.getState(),
		batchData = state.batches[id],
		batch = batchData?.batch;

	if (batch && batch.state !== BATCH_STATES.CANCELLED
		&& batch.state !== BATCH_STATES.FINISHED) {

		batch.items.forEach((bi) =>
			//using state items because batch items are different due to immer
			callAbortOnItem(state, bi.id));

		queue.updateState((state) => {
			state.batches[id].batch.state = BATCH_STATES.ABORTED;
		});

		triggerUploaderBatchEvent(queue, batch, UPLOADER_EVENTS.BATCH_ABORT);
	}
};

export {
	abortAll,
	abortItem,
	abortBatch,
};