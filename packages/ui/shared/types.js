// @flow
import type { UploaderType } from "@rupy/shared";

export type UploadyContextType = {
	uploader: UploaderType,
	getInputField: Function,
	showFileUpload: Function,
};