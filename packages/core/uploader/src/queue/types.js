// @flow
import type { Batch, BatchItem, Cancellable, UploadOptions } from "@rpldy/shared";
import type { TriggerMethod } from "@rpldy/life-events";
import type { ItemsSender, CreateOptions } from "../types";

export type BatchData = { batch: Batch, batchOptions: CreateOptions, finishedCounter: number };

export type State = {|
	itemQueue: string[],
	currentBatch: ?string,
	batches: { [string]: BatchData },
	items: { [string]: BatchItem },
	activeIds: Array<string | string[]>,
	aborts: { [string]: () => boolean },
|};

type UpdateStateMethod = ((State) => void) => void;
type GetStateMethod = () => State;

export type QueueState = {|
    uploaderId: string,
	getOptions: () => CreateOptions,
	getState: GetStateMethod,
	getCurrentActiveCount: () => number,
	updateState: UpdateStateMethod,
	trigger: TriggerMethod,
    runCancellable: Cancellable,
	sender: ItemsSender,
    handleItemProgress: (BatchItem, number, number) => void,
|};

export type UploaderQueue = {|
    updateState: UpdateStateMethod,
    getState: GetStateMethod,
    runCancellable: Cancellable,
    uploadBatch: (batch: Batch, batchOptions: ?CreateOptions) => void,
    addBatch: (batch: Batch, batchOptions: CreateOptions) => Batch,
    abortItem: (id: string) => boolean,
    abortBatch: (id: string) => void,
    abortAll: () => void,
    clearPendingBatches: () => void,
    uploadPendingBatches: (uploadOptions: ?UploadOptions) => void,
|};

export type ProcessNextMethod = (QueueState) => Promise<void>;
