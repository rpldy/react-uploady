// @flow
import React from "react";
import type { UploaderType } from "@rpldy/uploader";
import type { UploadyContextType } from "./types";
import type { UploadInfo, UploadOptions } from "@rpldy/shared";
import type { EventCallback } from "@rpldy/life-events";

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

	const on = (name: any, cb: EventCallback) => {
		return uploader.on(name, cb);
	};

	const once = (name: any, cb: EventCallback) => {
		return uploader.once(name, cb);
	};

	const off = (name: any, cb?: EventCallback) => {
		uploader.off(name, cb);
	};

	return {
		uploader,
		getInputField,
		showFileUpload,
		upload,
		on,
		once,
		off,
	};
};

export default UploadyContext;

export {
	createContextApi,
};