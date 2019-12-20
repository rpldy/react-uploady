// @flow
import { throttle } from "lodash";
import { logger, isFunction, BATCH_STATES, FILE_STATES } from "@rpldy/shared";
import defaultSend from "@rpldy/sender";
import triggerCancellable from "./triggerCancellable";
import { UPLOADER_EVENTS, PROGRESS_DELAY } from "./consts";
import { DEFAULT_OPTIONS, DEFAULT_PARAM_NAME } from "./defaults";

import type { Batch, BatchItem, UploadData, CreateOptions } from "@rpldy/shared";

//TODO: need a way to augment batch data at any point !!!!!!!!!

//TODO: implement processing pipeline
//TODO: ex: preview

type State = {
	currentBatch: ?string,
	batches: { [string]: { batch: Batch, addOptions: CreateOptions } },
	items: { [string]: BatchItem },
	activeIds: string[],
};

const FILE_STATE_TO_EVENT_MAP = {
	[FILE_STATES.FINISHED]: UPLOADER_EVENTS.FILE_FINISH,
	[FILE_STATES.ERROR]: UPLOADER_EVENTS.FILE_ERROR,
	[FILE_STATES.CANCELLED]: UPLOADER_EVENTS.FILE_CANCEL,
};

export const initUploadQueue = (
	state: State,
	options: CreateOptions,
	cancellable: Function,
	trigger: Function
) => {
	const {
		concurrent = DEFAULT_OPTIONS.concurrent,
		maxConcurrent = DEFAULT_OPTIONS.maxConcurrent
	} = options;

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

	const sendFiles = (items: BatchItem[], addOptions: CreateOptions) => {
		//TODO: need to apply grouping of files
		const destination = addOptions.destination,
			url = destination && destination.url,
			paramName = destination && destination.filesParamName;

		if (!url) {
			throw new Error("Destination URL not found! Can't send files without it");
		}

		const throttledProgress = throttle(
			(e: ProgressEvent) => onItemUploadProgress(items, e), PROGRESS_DELAY);

		const send = isFunction(addOptions.send) ? addOptions.send : defaultSend;

		return send(items[0], url, {
			method: addOptions.method || DEFAULT_OPTIONS.method,
			paramName: paramName || addOptions.inputFieldName || DEFAULT_PARAM_NAME,
			params: { //TODO: might need to rethink the order here:
				...addOptions.params,
				...(destination && destination.params),
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

			processNext(); //needed when concurrent is allowed
		} else {
			onRequestFinished(id, { state: FILE_STATES.CANCELLED, response: "cancel" });
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
					if (!allowBatch) {
						cancelBatchForItem(id);
						processNext();
					}
				}

				processBatchItem(id);
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

			trigger(FILE_STATE_TO_EVENT_MAP[item.state], item);
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

		return processNext();
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

	const process = (batch: Batch, addOptions: CreateOptions) => {
		state.batches[batch.id] = { batch, addOptions };
		batch.items.forEach(queue.add);
		queue.uploadItems();
	};

	return {
		process,
	};
};