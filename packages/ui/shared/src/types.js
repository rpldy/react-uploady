// @flow
import type { UploadInfo, UploadOptions } from "@rpldy/shared";
import type { CreateOptions } from "@rpldy/uploader";
import type { OnAndOnceMethod, OffMethod } from "@rpldy/life-events";

export type RefObject<T: mixed> = {current: null | void | T};

export type AddUploadFunction = (files: UploadInfo | UploadInfo[], addOptions: ?UploadOptions) => void;

export type InputRef = { current: ?HTMLInputElement };

export type UploadyContextType = {
    setExternalFileInput: (InputRef) => void,
    hasUploader: () => boolean,
	showFileUpload: (?UploadOptions) => void,
	upload: AddUploadFunction,
	processPending: () => void,
    setOptions: (CreateOptions) => void,
    getOptions: () => CreateOptions,
	on: OnAndOnceMethod,
	once: OnAndOnceMethod,
	off: OffMethod,
	abort: (id?: string) => void,
	abortBatch: (id: string) => void,
    getExtension: (any) => ?Object,
};
