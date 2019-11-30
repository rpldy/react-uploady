// @flow
import type { UploaderType } from "@rupy/uploader";

export type UploadyContextType = {
	uploader: UploaderType,
	getInputField: Function,
	showFileUpload: Function,
};