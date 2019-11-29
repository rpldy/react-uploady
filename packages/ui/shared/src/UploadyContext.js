// @flow
import React from "react";
import type { UploaderType } from "@rupy/shared";
import type { UploadyContextType } from "../types";

const UploadyContext = React.createContext<?UploadyContextType>(null);

const createContextApi = (uploader: UploaderType, inputRef: { current: ?HTMLInputElement }): UploadyContextType => {

	const getInputField = () => inputRef.current;

	const showFileUpload = () => {
		const input = getInputField();
		if (input) {
			input.click();
		}
	};

	return {
		uploader,
		getInputField,
		showFileUpload,
	};
};

export default UploadyContext;

export {
	createContextApi,
};