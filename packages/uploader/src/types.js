// @flow

import type {
	CreateOptions,
	UploadInfo,
	UploadOptions,
} from "@rpldy/shared";

import type { OnAndOnceMethod, OffMethod } from "@rpldy/life-events";

export type UploaderType = {
	id: string,
	update: (updateOptions: CreateOptions) => UploaderType,
	add: (files: UploadInfo | UploadInfo[], addOptions?: UploadOptions) => Promise<void>,
	upload: () => void,
	abort: () => void,
	getOptions: () => CreateOptions,
	on: OnAndOnceMethod,
	once: OnAndOnceMethod,
	off: OffMethod,
};

export type Trigger = (event: string, ...args: mixed[]) => Promise<mixed>[];

export type UploaderEnhancer = (uploader: UploaderType, trigger: Trigger) => UploaderType;