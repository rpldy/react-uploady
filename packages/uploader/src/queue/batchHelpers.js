// @flow
import { BATCH_STATES, logger } from "@rpldy/shared";
import { UPLOADER_EVENTS } from "../consts";

import type { BatchData, QueueState } from "./types";
import type { Batch, BatchItem } from "@rpldy/shared";

const isItemBelongsToBatch = (queue: QueueState, itemId: string, batchId: string): boolean => {
	return queue.getState()
		.items[itemId].batchId === batchId;
};

const getBatchDataFromItemId = (queue: QueueState, itemId: string): BatchData => {
	console.log("getBatchDataFromItemId", itemId)
	const state = queue.getState();
	const item = state.items[itemId];
	return state.batches[item.batchId];
};

const getBatchFromItemId = (queue: QueueState, itemId: string): Batch => {
	return getBatchDataFromItemId(queue, itemId).batch;
};

const cancelBatchForItem = (queue: QueueState, itemId: string) => {
	const batch = getBatchFromItemId(itemId);

	if (batch) {
		logger.debugLog("uploady.uploader.processor: cancelling batch: ", { batch });
		batch.items.forEach((bi: BatchItem) => {
			delete state.items[bi.id];

			const index = itemQueue.indexOf(bi.id);

			if (~index) {
				itemQueue.splice(index, 1);
			}
		});

		delete state.batches[batch.id];

		batch.state = BATCH_STATES.CANCELLED;
		trigger(UPLOADER_EVENTS.BATCH_CANCEL, batch);
	}
};

const isNewBatchStarting = (queue: QueueState, itemId: string): boolean => {
	const batch = getBatchFromItemId(queue, itemId);
	return queue.getState().currentBatch !== batch.id;
};

const loadNewBatchForItem = async (queue: QueueState, itemId: string) => {
	const batch = getBatchFromItemId(queue, itemId);

	const isCancelled = await queue.cancellable(UPLOADER_EVENTS.BATCH_START, batch);

	if (!isCancelled) {
		queue.updateState((state) => {
			state.currentBatch = batch.id;
		});
	}

	return !isCancelled;
};

const isBatchFinished = (queue: QueueState): boolean => {
	const itemQueue = queue.getState().itemQueue;
	return itemQueue.length === 0 ||
		isNewBatchStarting(queue, itemQueue[0]);
};

const cleanUpFinishedBatch = (queue: QueueState) => {
	const state = queue.getState();
	const batchId = state.currentBatch;

	if (batchId && isBatchFinished(queue)) {
		const batch = state.batches[batchId].batch;

		queue.updateState((state) => {
			delete state.batches[batchId];
		});

		queue.trigger(UPLOADER_EVENTS.BATCH_FINISH, batch);
	}
};

export {
	isBatchFinished,
	loadNewBatchForItem,
	isNewBatchStarting,
	cancelBatchForItem,
	getBatchFromItemId,
	isItemBelongsToBatch,
	getBatchDataFromItemId,
	cleanUpFinishedBatch
};