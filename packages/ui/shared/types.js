// @flow
import type { UploaderType } from "@rupy/uploader";
import type { UploadInfo, UploadOptions } from "@rupy/shared";

export type AddUploadFunction = (files: UploadInfo | UploadInfo[], addOptions: UploadOptions) => void;

export type UploadyContextType = {
	uploader: UploaderType,
	getInputField: () => ?HTMLInputElement,
	showFileUpload: () => void,
	upload: AddUploadFunction,
};