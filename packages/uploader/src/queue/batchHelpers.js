// @flow
import { BATCH_STATES, logger } from "@rpldy/shared";
import { UPLOADER_EVENTS } from "../consts";

import type { BatchData, QueueState, State } from "./types";
import type { Batch, BatchItem } from "@rpldy/shared";

const isItemBelongsToBatch = (queue: QueueState, itemId: string, batchId: string): boolean => {
	return queue.getState()
		.items[itemId].batchId === batchId;
};

const getBatchDataFromItemId = (queue: QueueState, itemId: string): BatchData => {
	const state = queue.getState();
	const item = state.items[itemId];
	return state.batches[item.batchId];
};

const getBatchFromItemId = (queue: QueueState, itemId: string): Batch => {
	return getBatchDataFromItemId(queue, itemId).batch;
};

const cancelBatchForItem = (queue: QueueState, itemId: string) => {
	const batch = getBatchFromItemId(queue, itemId);

	if (batch) {
		logger.debugLog("uploady.uploader.processor: cancelling batch: ", { batch });
		const items = batch.items.map((item: BatchItem) => item.id);

		queue.updateState((state: State) => {
			items.forEach((id: string) => {
				delete state.items[id];

				const index = state.itemQueue.indexOf(id);

				if (~index) {
					state.itemQueue.splice(index, 1);
				}
			});

			batch.state = BATCH_STATES.CANCELLED;

			delete state.batches[batch.id];
		});

		queue.trigger(UPLOADER_EVENTS.BATCH_CANCEL, batch);
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