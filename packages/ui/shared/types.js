// @flow
import type { UploaderType } from "@rpldy/uploader";
import type { UploadInfo, UploadOptions } from "@rpldy/shared";

export type AddUploadFunction = (files: UploadInfo | UploadInfo[], addOptions: UploadOptions) => void;

export type UploadyContextType = {
	uploader: UploaderType,
	getInputField: () => ?HTMLInputElement,
	showFileUpload: () => void,
	upload: AddUploadFunction,
};