// @flow
import { FILE_STATES } from "@rpldy/shared";
import { UPLOADER_EVENTS } from "../consts";
import processFinishedRequest from "./processFinishedRequest";

import type { BatchItem } from "@rpldy/shared";
import type { QueueState, ProcessNextMethod } from "./types";

const sendAllowedItems = async (queue: QueueState, items: BatchItem[], next: ProcessNextMethod) => {
	const batchOptions = queue.getState().batches[items[0].batchId].batchOptions,
		allowedIds = items.map((item: BatchItem) => item.id);

	queue.updateState((state) => {
		state.activeIds = state.activeIds.concat(allowedIds);
	});

	const sendResult = queue.sender.send(items, batchOptions);

	queue.updateState((state) => {
		allowedIds.forEach((id: string) => {
			state.items[id].abort = sendResult.abort;
		});
	});

	const requestInfo = await sendResult.request;

	const finishedData = allowedIds.map((id: string) => ({
		id,
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

export default async (queue: QueueState, ids: string[], next: ProcessNextMethod) => {
	const state = queue.getState();
	//items can have more than one item when grouping is allowed
	let items: any[] = Object.values(state.items);
	items = items.filter((item: BatchItem) => !!~ids.indexOf(item.id));

	const cancelledResults = await Promise.all(items.map((i: BatchItem) =>
		queue.cancellable(UPLOADER_EVENTS.FILE_START, i)));

	const allowedItems: BatchItem[] = cancelledResults
		.map((isCancelled: boolean, index: number): ?BatchItem => isCancelled ? null : items[index])
		.filter(Boolean);

	if (allowedItems.length) {
		sendAllowedItems(queue, allowedItems, next);
	}

	if (!reportCancelledItems(queue, items, cancelledResults, next)) {
		await next(queue); //when concurrent is allowed, we can go ahead and process more
	}
};

