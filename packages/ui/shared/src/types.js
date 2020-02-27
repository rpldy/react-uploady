// @flow
import type { UploadInfo, UploadOptions } from "@rpldy/shared";
import type { OnAndOnceMethod, OffMethod } from "@rpldy/life-events";

export type AddUploadFunction = (files: UploadInfo | UploadInfo[], addOptions: ?UploadOptions) => void;

export type UploadyContextType = {
    hasUploader: () => boolean,
	showFileUpload: (?UploadOptions) => void,
	upload: AddUploadFunction,
	on: OnAndOnceMethod,
	once: OnAndOnceMethod,
	off: OffMethod,
	abort: (id?: string) => void,
	abortBatch: (id: string) => void,
};
