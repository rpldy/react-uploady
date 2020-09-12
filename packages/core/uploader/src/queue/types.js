// @flow

import type { Batch, BatchItem, Cancellable } from "@rpldy/shared";
import type { TriggerMethod } from "@rpldy/life-events";
import type { ItemsSender, CreateOptions } from "../types";

export type BatchData = { batch: Batch, batchOptions: CreateOptions };

export type State = {|
	itemQueue: string[],
	currentBatch: ?string,
	batches: { [string]: BatchData },
	items: { [string]: BatchItem },
	activeIds: Array<string | string[]>,
	aborts: { [string]: () => boolean },
|};

export type QueueState = {|
	getOptions: () => CreateOptions,
	getState: () => State,
	getCurrentActiveCount: () => number,
	updateState: ((State) => void) => void,
	trigger: TriggerMethod,
	cancellable: Cancellable,
	sender: ItemsSender,
    handleItemProgress: (BatchItem, number, number) => void,
|};

export type ProcessNextMethod = (QueueState) => Promise<void>;
