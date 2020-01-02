// @flow

import produce from "immer";
import {logger} from "@rpldy/shared";
import processQueueNext from "./processQueueNext";

import type { Batch, BatchItem, CreateOptions } from "@rpldy/shared";
import type { TriggerMethod } from "@rpldy/life-events";
import type { Cancellable, ItemsSender } from "../types";
import { SENDER_EVENTS } from "../consts";

export default (
	options: CreateOptions,
	cancellable: Cancellable,
	trigger: TriggerMethod,
	sender: ItemsSender,
	uploaderId: string,
) => {
	let state = {
		itemQueue: [],
		currentBatch: null,
		batches: {},
		items: {},
		activeIds: [],
	};

	sender.on(SENDER_EVENTS.PROGRESS,
		(item: BatchItem, completed: number, loaded: number) => {
			if (state.items[item.id]) {
				updateState((state) => {
					const stateItem = state.items[item.id];
					stateItem.loaded = loaded;
					stateItem.completed = completed;
				});
			}
		});

	const updateState = (updater) => {
		state = produce(state, updater);
	};

	const add = (item: BatchItem) => {
		updateState((state) => {
			state.items[item.id] = item;
			state.itemQueue.push(item.id);
		});
	};

	const uploadBatch = (batch: Batch, batchOptions: CreateOptions) => {
		updateState((state) => {
			state.batches[batch.id] = { batch, batchOptions };
		});

		batch.items.forEach(add);

		processQueueNext(queueState);
	};

	const queueState = {
		getOptions: () => options,
		getState: () => state,
		getCurrentActiveCount: () => state.activeIds.length,
		updateState,
		trigger,
		cancellable,
		sender,
	};

	if (logger.isDebugOn()){
		window[`${uploaderId}_queue_state`] = queueState;
	}

	return {
		uploadBatch,
	};
};