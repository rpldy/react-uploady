// @flow
import type { Batch, BatchItem, Cancellable, UploadOptions } from "@rpldy/shared";
import type { TriggerMethod } from "@rpldy/life-events";
import type { AbortsMap } from "@rpldy/abort";
import type { ItemsSender, UploaderCreateOptions } from "../types";

export type BatchData = { batch: Batch, batchOptions: UploaderCreateOptions, finishedCounter: number };

export type State = {|
	itemQueue: { [string]: string[] },
    batchQueue: string[],
	currentBatch: ?string,
    batchesStartPending: string[],
	batches: { [string]: BatchData },
	items: { [string]: BatchItem },
	activeIds: Array<string | string[]>,
	aborts: AbortsMap,
|};

type UpdateStateMethod = ((State) => void) => void;
type GetStateMethod = () => State;

export type QueueState = {|
    uploaderId: string,
	getOptions: () => UploaderCreateOptions,
	getState: GetStateMethod,
	getCurrentActiveCount: () => number,
	updateState: UpdateStateMethod,
	trigger: TriggerMethod,
    runCancellable: Cancellable,
	sender: ItemsSender,
    handleItemProgress: (BatchItem, number, number, number) => void,
    clearAllUploads: () => void,
    clearBatchUploads: (string) => void,
|};

export type UploaderQueue = {|
    updateState: UpdateStateMethod,
    getState: GetStateMethod,
    runCancellable: Cancellable,
    uploadBatch: (batch: Batch, batchOptions: ?UploaderCreateOptions) => void,
    addBatch: (batch: Batch, batchOptions: UploaderCreateOptions) => Batch,
    abortItem: (id: string) => boolean,
    abortBatch: (id: string) => void,
    abortAll: () => void,
    clearPendingBatches: () => void,
    uploadPendingBatches: (uploadOptions: ?UploadOptions) => void,

    cancelBatch: (batch: Batch) => void,
|};

export type ProcessNextMethod = (QueueState) => Promise<void> | void;
