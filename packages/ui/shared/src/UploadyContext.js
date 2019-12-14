// @flow
import React from "react";
import type { UploaderType } from "@rpldy/uploader";
import type { UploadyContextType } from "./types";
import type { UploadInfo, UploadOptions } from "@rpldy/shared";

const UploadyContext = React.createContext<?UploadyContextType>(null);

const createContextApi = (uploader: UploaderType, inputRef: { current: ?HTMLInputElement }): UploadyContextType => {

	const getInputField = () => inputRef.current;

	const showFileUpload = () => {
		const input = getInputField();
		if (input) {
			input.click();
		}
	};

	const upload = (files: UploadInfo | UploadInfo[], addOptions: UploadOptions) => {
		uploader.add(files, addOptions);
	};

	return {
		uploader,
		getInputField,
		showFileUpload,
		upload,
	};
};

export default UploadyContext;

export {
	createContextApi,
};