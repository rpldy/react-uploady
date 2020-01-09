// @flow
import { logger } from "@rpldy/shared";

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

	const batch = queue.getState().batches[id];


};

export {
	abortAll,
	abortItem,
	abortBatch,
};