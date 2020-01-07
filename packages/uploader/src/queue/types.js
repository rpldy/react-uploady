// @flow

import type { Batch, BatchItem, CreateOptions, Cancellable } from "@rpldy/shared";
import type { TriggerMethod } from "@rpldy/life-events";
import type { ItemsSender } from "../types";

export type BatchData = { batch: Batch, batchOptions: CreateOptions };

export type State = {
	itemQueue: string[],
	currentBatch: ?string,
	batches: { [string]: BatchData },
	items: { [string]: BatchItem },
	activeIds: Array<string | string[]>,
};

// export type QueueUpdater = Updater<BatchItem | BatchItem[] | Batch>;

export type QueueState = {
	getOptions: () => CreateOptions,
	getState: () => State,
	getCurrentActiveCount: () => number,
	updateState: ((State) => void) => void,
	trigger: TriggerMethod,
	cancellable: Cancellable,
	sender: ItemsSender,
};

export type ProcessNextMethod = (QueueState) => Promise<void>;