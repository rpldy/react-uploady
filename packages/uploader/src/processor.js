// @flow

import triggerCancellable from "./triggerCancellable";
import UPLOADER_EVENTS from "./consts";
import type {
	CreateOptions,
	AddOptions,
	Destination,
	UploadInfo
} from "@rupy/shared";
import type { Batch, BatchItem } from "../types";
import { BATCH_STATES } from "@rupy/shared";


//TODO: implement processing pipeline
//TODO: ex: preview

type State = {
	currentBatch: string,
	// queue: string[],
	batches: { [string]: Batch },
	items: { [string]: BatchItem },
	requests: { [string]: Object },
};


const send = (files: BatchItem) => {


};

const initUploadQueue = (
	state: State,
	options: CreateOptions,
	cancellable: Function,
	trigger: Function
) => {
	const { concurrent, maxConcurrent } = options;
	const itemQueue: string[] = [];

	const getBatchFromItemId = (itemId: String): Batch => {
		const item = state.items[itemId];
		return state.batches[item.batchId];
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
		const batch = getBatchFromItemId(itemId);

		const isCancelled = await cancellable(UPLOADER_EVENTS.BATCH_START, batch);

		if (!isCancelled) {
			state.currentBatch = batch.id;
		}

		return !isCancelled;
	};

	const processBatchItem = async (id: string) => {
		const item = state.items[id];
		const batch = state.batches[item.batchId];



		//TODO: if file cancelled - processNext()


	};

	const processNext = async () => {
		const id = itemQueue[0];
		//TODO: refactor to support grouping of files in single request

		if (id && itemQueue.indexOf(id)) {
			const currentCount = state.requests.length;

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

	const onRequestFinished = (id: string) => {
		const index = state.queue.indexOf(id);

		if (~index) {
			queue.splice(index, 1);
			delete state.requests[id];
		}

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
		requests: {},
	};

	const queue = initUploadQueue(options, state, cancellable, trigger);

	const process = (batch: Batch, addOptions: AddOptions) => {
		state.batches[batch.id] = { batch, addOptions };
		batch.items.forEach(queue.add);
		queue.onBatchItemsAdded();
	};

	return {
		process,
	};
}