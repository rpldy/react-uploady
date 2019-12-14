// @flow

import type {
	CreateOptions,
	UploadInfo,
	UploadOptions,
} from "@rupy/shared";

export type UploaderType = {
	id: string,
	update: (updateOptions: CreateOptions) => UploaderType,
	add: (files: UploadInfo | UploadInfo[], addOptions?: UploadOptions) => Promise<void>,
	upload: () => void,
	abort: () => void,
	getOptions: () => CreateOptions,
	on: (name: any, cb: Function) => void,
	off: (name: any, cb?: Function) => void,
};

export type Trigger = (event: string, ...args: mixed[]) => Promise<mixed>[];

export type UploaderEnhancer = (uploader: UploaderType, trigger: Trigger) => UploaderType;