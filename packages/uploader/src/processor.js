// @flow
import { throttle } from "lodash";
import { logger, BATCH_STATES, FILE_STATES } from "@rupy/shared";
import defaultSend from "@rupy/sender";
import triggerCancellable from "./triggerCancellable";
import { UPLOADER_EVENTS, PROGRESS_DELAY } from "./consts";

import type { CreateOptions, Batch, BatchItem, UploadData, } from "@rupy/shared";
import type { MandatoryCreateOptions } from "./types";

//TODO: need a way to augment batch data at any point !!!!!!!!!

//TODO: implement processing pipeline
//TODO: ex: preview

type State = {
	currentBatch: ?string,
	batches: { [string]: { batch: Batch, addOptions: MandatoryCreateOptions } },
	items: { [string]: BatchItem },
	activeIds: string[],
};

export const initUploadQueue = (
	state: State,
	options: MandatoryCreateOptions,
	cancellable: Function,
	trigger: Function
) => {
	const { concurrent, maxConcurrent } = options;

	const itemQueue: string[] = [];

	const getBatchFromItemId = (itemId: string): Batch => {
		const item = state.items[itemId];
		return state.batches[item.batchId].batch;
	};

	const cancelBatchForItem = (itemId: string) => {
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

	const isNewBatchStarting = (itemId: string): boolean => {
		const batch = getBatchFromItemId(itemId);
		return state.currentBatch !== batch.id;
	};

	const isBatchFinished = (): boolean => {
		//TODO: need to consider group size here!
		return itemQueue.length < 2 ||
			isNewBatchStarting(itemQueue[1]);
	};

	const loadNewBatchForItem = async (itemId: string) => {
		const batch = getBatchFromItemId(itemId);

		const isCancelled = await cancellable(UPLOADER_EVENTS.BATCH_START, batch);

		if (!isCancelled) {
			state.currentBatch = batch.id;
		}

		return !isCancelled;
	};

	const onItemUploadProgress = (items: BatchItem[], e: ProgressEvent) => {
		const completed = (e.loaded / e.total) * 100,
			completedPerItem = completed / items.length,
			loadedPerItem = e.loaded / items.length;

		items.forEach((i: BatchItem) => {
			logger.debugLog(`uploady.uploader.processor: file: ${i.id} progress event: loaded(${loadedPerItem}) - completed(${completedPerItem})`);
			i.completed = completedPerItem;
			i.loaded = loadedPerItem;
			trigger(UPLOADER_EVENTS.FILE_PROGRESS, i);
		});
	};

	const sendFiles = (items: BatchItem[], addOptions: MandatoryCreateOptions) => {

		//TODO: need to apply grouping of files

		const url = addOptions.destination.url;

		const throttledProgress = throttle(
			(e: ProgressEvent) => onItemUploadProgress(items, e), PROGRESS_DELAY);

		const send = addOptions.send ? addOptions.send : defaultSend;

		return send(items[0], url, {
			method: addOptions.method,
			paramName: addOptions.destination.filesParamName,
			params: { //TODO: might need to rethink the order here:
				...addOptions.params,
				...addOptions.destination.params,
			},
			forceJsonResponse: addOptions.forceJsonResponse,
			withCredentials: addOptions.withCredentials,
		}, throttledProgress);
	};

	const processBatchItem = async (id: string) => {
		const item = state.items[id];
		const batchData = state.batches[item.batchId];

		const isCancelled = await cancellable(UPLOADER_EVENTS.FILE_START, item);

		if (!isCancelled) {
			state.activeIds.push(id);

			const sendResult = sendFiles([item], batchData.addOptions);

			item.abort = sendResult.abort;

			sendResult.request
				.then((info) => onRequestFinished(id, info));

			processNext(); //needed for concurrent is allowed
		} else {
			item.state = FILE_STATES.CANCELLED;
			trigger(UPLOADER_EVENTS.FILE_CANCEL, item);
			processNext();
		}
	};

	const processNext = async () => {
		const id = itemQueue[0];
		//TODO: refactor to support grouping of files in single request

		if (id && ~itemQueue.indexOf(id) &&
			!~state.activeIds.indexOf(id)) { //if valid id and not already being uploaded
			const currentCount = state.activeIds.length;

			logger.debugLog("uploady.uploader.processor: Processing next upload - ", {
				id,
				itemQueue,
				currentCount
			});

			if (!currentCount || (concurrent && currentCount < maxConcurrent)) {
				if (isNewBatchStarting(id)) {
					const allowBatch = await loadNewBatchForItem(id);

					if (allowBatch) {
						processBatchItem(id);
					} else {
						cancelBatchForItem(id);
						processNext();
					}
				}
			}
		}
	};

	const cleanUpFinishedBatch = () => {
		const batchId = state.currentBatch;

		if (batchId && isBatchFinished()) {
			const batch = state.batches[batchId].batch;
			delete state.batches[batchId];
			trigger(UPLOADER_EVENTS.BATCH_FINISH, batch);
		}
	};

	const onRequestFinished = (id: string, uploadInfo: UploadData) => {
		const item = state.items[id];

		logger.debugLog("uploady.uploader.processor: request finished - ", { id, uploadInfo });

		if (item) {
			item.state = uploadInfo.state;
			item.uploadResponse = uploadInfo.response;

			const fileEvent = item.state === FILE_STATES.ERROR ?
				UPLOADER_EVENTS.FILE_ERROR : UPLOADER_EVENTS.FILE_FINISH;

			trigger(fileEvent, item);
		}

		cleanUpFinishedBatch();

		const index = itemQueue.indexOf(id);

		if (~index) {
			itemQueue.splice(index, 1);
			const activeIndex = state.activeIds.indexOf(id);

			if (~activeIndex) {
				state.activeIds.splice(activeIndex, 1);
			}
		}

		processNext();
	};

	const add = (item: BatchItem) => {
		state.items[item.id] = item;
		itemQueue.push(item.id);
	};

	const uploadItems = () => { //needed to support grouping into single request
		processNext();
	};

	return {
		add,
		uploadItems,

		//exported for testing purposes:
		processBatchItem,
		sendFiles,
		loadNewBatchForItem,
		cancelBatchForItem,
		onRequestFinished,
		cleanUpFinishedBatch,
		getItemQueue: () => itemQueue,
	};
};

export default (trigger: Function, options: CreateOptions) => {
	const cancellable = triggerCancellable(trigger);

	const state = {
		currentBatch: null,
		batches: {},
		items: {},
		activeIds: [],
	};

	const queue = initUploadQueue(state, options, cancellable, trigger);

	const process = (batch: Batch, addOptions: MandatoryCreateOptions) => {
		state.batches[batch.id] = { batch, addOptions };
		batch.items.forEach(queue.add);
		queue.uploadItems();
	};

	return {
		process,
	};
};