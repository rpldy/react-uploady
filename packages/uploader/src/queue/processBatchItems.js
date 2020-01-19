// @flow
import { triggerUpdater, isSamePropInArrays, FILE_STATES } from "@rpldy/shared";
import { UPLOADER_EVENTS } from "../consts";
import processFinishedRequest from "./processFinishedRequest";

import type { BatchItem, SendResult } from "@rpldy/shared";
import type { QueueState, ProcessNextMethod } from "./types";

const triggerPreSendUpdate = async (queue: QueueState, items: BatchItem[]) => {
	// $FlowFixMe - https://github.com/facebook/flow/issues/8215
	const updated = await triggerUpdater<BatchItem[]>(
		queue.trigger, UPLOADER_EVENTS.REQUEST_PRE_SEND, items);

	if (updated) {
		if (updated.length !== items.length ||
			!isSamePropInArrays(updated, items, ["id", "batchId"])) {
			throw new Error(`REQUEST_PRE_SEND event handlers must return same items with same ids`);
		}

		items = updated;
	}

	return items;
};

const prepareAllowedItems = async (queue: QueueState, items: BatchItem[]): Promise<BatchItem[]> => {
	const allowedIds = items.map((item: BatchItem) => item.id);

	queue.updateState((state) => {
		state.activeIds = state.activeIds.concat(allowedIds);
	});

	items = await triggerPreSendUpdate(queue, items);

	return items;
};

const updateUploadingState = (queue: QueueState, items: BatchItem[], sendResult: SendResult) => {
	queue.updateState((state) => {
		items.forEach((bi) => {
			const item = state.items[bi.id];
			item.state = FILE_STATES.UPLOADING;
			state.aborts[bi.id] = sendResult.abort;
		});
	});
};

const sendAllowedItems = async (queue: QueueState, items: BatchItem[], next: ProcessNextMethod) => {
	const batchOptions = queue.getState().batches[items[0].batchId].batchOptions;

	const sendResult = queue.sender.send(items, batchOptions);

	updateUploadingState(queue, items, sendResult);

	const requestInfo = await sendResult.request; //wait for server request to return

	const finishedData = items.map((item) => ({
		id: item.id,
		info: requestInfo,
	}));

	processFinishedRequest(queue, finishedData, next);
};

const reportCancelledItems = (queue: QueueState, items: BatchItem[], cancelledResults: boolean[], next: ProcessNextMethod): boolean => {
	const cancelledItemsIds: string[] = cancelledResults
		.map((isCancelled: boolean, index: number) => isCancelled ? items[index].id : null)
		.filter(Boolean);

	if (cancelledItemsIds.length) {
		const finishedData = cancelledItemsIds.map((id: string) => ({
			id,
			info: { state: FILE_STATES.CANCELLED, response: "cancel" },
		}));

		processFinishedRequest(queue, finishedData, next); //report out info about cancelled items
	}

	return !cancelledResults.length;
};

//send group of items to be uploaded
export default async (queue: QueueState, ids: string[], next: ProcessNextMethod) => {
	const state = queue.getState();
	//items can have more than one item when grouping is allowed
	let items: any[] = Object.values(state.items);
	items = items.filter((item: BatchItem) => !!~ids.indexOf(item.id));

	const cancelledResults = await Promise.all(items.map((i: BatchItem) =>
		queue.cancellable(UPLOADER_EVENTS.ITEM_START, i)));

	let allowedItems: BatchItem[] = cancelledResults
		.map((isCancelled: boolean, index: number): ?BatchItem => isCancelled ? null : items[index])
		.filter(Boolean);

	if (allowedItems.length) {
		allowedItems = await prepareAllowedItems(queue, allowedItems);
		sendAllowedItems(queue, allowedItems, next); //we dont need to wait for the response here
	}

	if (!reportCancelledItems(queue, items, cancelledResults, next)) {
		await next(queue); //when concurrent is allowed, we can go ahead and process more
	}
};

