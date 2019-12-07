// @flow

import type { BatchItem, FileState } from "@rupy/shared";

export type SendOptions = {
	method: string,
	paramName: string,
	params: Object,
	// encoding: string,
	headers?: Object,
	forceJsonResponse: ?boolean,
	withCredentials: ?boolean,
};

export type UploadData = {
	state: FileState,
	response: any,
};

export type SendResult = {
	request: Promise<UploadData>,
	abort: () => void
};

export type OnProgress = (e: Event) => void;

export type SendMethod = (item: BatchItem, url: string, options: SendOptions, onProgress: OnProgress) => SendResult;

export type MockOptions = {
	//the time in ms it should take to "upload"
    delay?: number,
	//the mock percentages to emit progress events on (default: 10, 25, 50, 75, 100)
	progressEvents?: string[],
};
