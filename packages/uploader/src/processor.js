// @flow
import { BATCH_STATES, FILE_STATES } from "@rupy/shared";
import triggerCancellable from "./triggerCancellable";
import { UPLOADER_EVENTS } from "./consts";
import send from "./sender";

import type {
	CreateOptions,
	// AddOptions,
	// FileState,
	// Destination,
	// UploadInfo
} from "@rupy/shared";

import type { Batch, BatchItem, MandatoryAddOptions } from "../types";
import type { UploadData } from "./sender";

//TODO: need a way to augment batch data at any point !!!!!!!!!

//TODO: implement processing pipeline
//TODO: ex: preview

type State = {
	currentBatch: ?string,
	batches: { [string]: { batch: Batch, addOptions: MandatoryAddOptions } },
	items: { [string]: BatchItem },
	activeIds: string[], //{ [string]: Object },
};

const initUploadQueue = (
	state: State,
	options: MandatoryAddOptions,
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
	};

	const isNewBatchStarting = (itemId: string): boolean => {
		const batch = getBatchFromItemId(itemId);
		return state.currentBatch !== batch.id;
	};

	const loadNewBatchForItem = async (itemId: string) => {
		// const previousBatch = state.batches[state.currentBatch].batch;
		// trigger(UPLOADER_EVENTS.BATCH_FINISH, previousBatch);

		const batch = getBatchFromItemId(itemId);

		const isCancelled = await cancellable(UPLOADER_EVENTS.BATCH_START, batch);

		if (!isCancelled) {
			state.currentBatch = batch.id;
		}

		return !isCancelled;
	};

	const sendFiles = (items: BatchItem[], addOptions: AddOptions) => {

		//TODO: consider grouping of files

		const url = addOptions.destination.url;

		return send(items[0], url, {
			method: addOptions.method,
			paramName: addOptions.destination.filesParamName,
			params: { //TODO: might need to rethink the order here:
				...addOptions.params,
				...addOptions.destination.params,
			},
			encoding: addOptions.encoding,

		});
	};

	const processBatchItem = async (id: string) => {
		const item = state.items[id];
		const batchData = state.batches[item.batchId];

		const isCancelled = await cancellable(UPLOADER_EVENTS.FILE_START, item);

		if (!isCancelled) {
			state.activeIds.push(id);

			sendFiles([item], batchData.addOptions)
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

			console.log("Processing - !!!!!!!!!!! ", { id, itemQueue, currentCount });

			if (!currentCount || (concurrent && currentCount < maxConcurrent)) {
				if (isNewBatchStarting(id)) {
					const continueBatch = await loadNewBatchForItem(id);

					if (continueBatch) {
						processBatchItem(id);
					} else {
						cancelBatchForItem(id);
						processNext();
					}
				}
			}
		}
	};

	const cleanFinishedBatch = () => {
		if (state.currentBatch && itemQueue.length &&
			isNewBatchStarting(itemQueue[0])) {
			trigger(UPLOADER_EVENTS.BATCH_FINISH, state.batches[state.currentBatch]);

			delete state.batches[state.currentBatch];
		}
	};

	const onRequestFinished = (id: string, uploadInfo: UploadData) => {
		const item = state.items[id];

		console.log("!!!!!!!!!! REQUEST FINISHED ", {id, uploadInfo})

		if (item) {
			item.state = uploadInfo.state;
			item.uploadData = uploadInfo.data;

			const fileEvent = item.state === FILE_STATES.ERROR ?
				UPLOADER_EVENTS.FILE_ERROR : UPLOADER_EVENTS.FILE_FINISH;

			trigger(fileEvent, item);
		}

		const index = itemQueue.indexOf(id);

		if (~index) {
			itemQueue.splice(index, 1);
			const activeIndex = state.activeIds.indexOf(id);

			if (~activeIndex) {
				state.activeIds.splice(activeIndex, 1);
			}
		}

		cleanFinishedBatch();

		processNext();
	};

	const add = (item: BatchItem) => {
		state.items[item.id] = item;
		itemQueue.push(item.id);
	};

	const onBatchItemsAdded = () => { //needed to support grouping into single request
		processNext();
	};

	return {
		add,
		onBatchItemsAdded,
	};
};

export default (trigger: Function, options: CreateOptions) => {
	const cancellable = triggerCancellable(trigger);

	const state = {
		currentBatch: null,
		batches: {},
		items: {},
		// requests: {},
		activeIds: [],
	};

	const queue = initUploadQueue(state, options, cancellable, trigger);

	const process = (batch: Batch, addOptions: MandatoryAddOptions) => {
		state.batches[batch.id] = { batch, addOptions };
		batch.items.forEach(queue.add);
		queue.onBatchItemsAdded();
	};

	return {
		process,
	};
}