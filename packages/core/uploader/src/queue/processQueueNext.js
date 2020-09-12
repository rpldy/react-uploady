// @flow
import { FILE_STATES, logger } from "@rpldy/shared";
import processBatchItems from "./processBatchItems";
import {
	getBatchDataFromItemId,
	getIsItemBatchReady,
	isNewBatchStarting,
	cancelBatchForItem,
	loadNewBatchForItem,
	isItemBelongsToBatch,
} from "./batchHelpers";

import type { BatchItem } from "@rpldy/shared";
import type { QueueState } from "./types";

const getIsItemInActiveRequest = (queue: QueueState, itemId: string): boolean => {
	return !!~queue.getState().activeIds
		// $FlowFixMe - no flat
		.flat().indexOf(itemId);
};

const getIsItemReady = (item: BatchItem) =>
	item.state === FILE_STATES.ADDED;

export const findNextItemIndex = (queue: QueueState): number => {
	const state = queue.getState(),
		itemQueue = state.itemQueue,
		items = state.items;
	let index = 0,
		nextId = itemQueue[index];

	//find item that isnt already in an active request and belongs to a "ready" batch
	while (nextId && (getIsItemInActiveRequest(queue, nextId) ||
		!getIsItemBatchReady(queue, nextId) ||
		!getIsItemReady(items[nextId]))) {
		index += 1;
		nextId = itemQueue[index];
	}

	return nextId ? index : -1;
};

export const getNextIdGroup = (queue: QueueState): ?string[] => {
	const itemQueue = queue.getState().itemQueue;
	const nextItemIndex = findNextItemIndex(queue);
	let nextId = itemQueue[nextItemIndex],
		nextGroup;

	if (nextId) {
		const batchData = getBatchDataFromItemId(queue, nextId);

		const batchId = batchData.batch.id,
			groupMax = batchData.batchOptions.maxGroupSize || 0;

		if (batchData.batchOptions.grouped && groupMax > 1) {
			nextGroup = [];
			let nextBelongsToSameBatch = true;

			//dont group files from different batches
			while (nextGroup.length < groupMax && nextBelongsToSameBatch) {
				nextGroup.push(nextId);
				nextId = itemQueue[nextItemIndex + nextGroup.length];
				nextBelongsToSameBatch = nextId &&
					isItemBelongsToBatch(queue, nextId, batchId);
			}
		} else {
			nextGroup = [nextId];
		}

	}

	return nextGroup;
};

const processNext = async (queue: QueueState) => {
	const ids = getNextIdGroup(queue);

	if (ids) {
		const currentCount = queue.getCurrentActiveCount(),
			{ concurrent = 0, maxConcurrent = 0 } = queue.getOptions();

		if (!currentCount || (concurrent && currentCount < maxConcurrent)) {
			logger.debugLog("uploader.processor: Processing next upload - ", {
				ids,
				state: queue.getState(),
				currentCount,
			});

			let cancelled = false;

			if (isNewBatchStarting(queue, ids[0])) {
				const allowBatch = await loadNewBatchForItem(queue, ids[0]);
				cancelled = !allowBatch;

				if (cancelled) {
					cancelBatchForItem(queue, ids[0]);
					processNext(queue);
				}
			}

			if (!cancelled) {
				processBatchItems(queue, ids, processNext);
			}
		}
	}
};

export default processNext;
