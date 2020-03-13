// @flow
import type { CreateOptions, UploadInfo, UploadOptions } from "@rpldy/shared";
import type { OnAndOnceMethod, OffMethod } from "@rpldy/life-events";

export type AddUploadFunction = (files: UploadInfo | UploadInfo[], addOptions: ?UploadOptions) => void;

export type InputRef = { current: ?HTMLInputElement };

export type UploadyContextType = {
    setExternalFileInput: (InputRef) => void,
    hasUploader: () => boolean,
	showFileUpload: (?UploadOptions) => void,
	upload: AddUploadFunction,
    setOptions: (CreateOptions) => void,
    getOptions: () => CreateOptions,
	on: OnAndOnceMethod,
	once: OnAndOnceMethod,
	off: OffMethod,
	abort: (id?: string) => void,
	abortBatch: (id: string) => void,
};
