// @flow

import type {
	CreateOptions,
	UploadInfo,
	UploadOptions,
	BatchItem,
	SendResult,
	Trigger,
	Batch,
} from "@rpldy/shared";

import type { OnAndOnceMethod, OffMethod } from "@rpldy/life-events";

export type PendingBatch = {
	batch: Batch,
	uploadOptions: CreateOptions,
};

export type UploaderType = {
	id: string,
	update: (updateOptions: CreateOptions) => UploaderType,
	add: (files: UploadInfo | UploadInfo[], addOptions?: ?UploadOptions) => Promise<void>,
	upload: () => void,
	abort: (id?: string) => void,
	abortBatch: (id: string) => void,
	getOptions: () => CreateOptions,
	getPending: () => PendingBatch[],
	clearPending: () => void,
	on: OnAndOnceMethod,
	once: OnAndOnceMethod,
	off: OffMethod,
};

export type UploaderEnhancer = (uploader: UploaderType, trigger: Trigger<mixed>) => UploaderType;

export type ItemsSender = {
	send: (BatchItem[], Batch, CreateOptions) => SendResult,
	on: OnAndOnceMethod,
};
