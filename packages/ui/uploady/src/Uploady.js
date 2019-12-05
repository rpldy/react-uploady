// @flow
import React, { useMemo, useRef, useCallback, useEffect } from "react";
import ReactDOM from "react-dom";
import { pick } from "lodash";
import createUploader, { DEFAULT_OPTIONS } from "@rupy/uploader";
import { logger } from "@rupy/shared";
import { UploadyContext, createContextApi } from "@rupy/shared-ui";

import type { UploaderType } from "@rupy/uploader";
import type { CreateOptions } from "@rupy/shared";
import type { UploadyProps } from "../types";

const FileInputFieldPortal = ({ container, children }) =>
	container && ReactDOM.createPortal(children, container);

const getUploaderOptions = (props: UploadyProps): CreateOptions =>
	pick(props, Object.keys(DEFAULT_OPTIONS));

const Uploady = (props: UploadyProps) => {

	logger.setDebug(!!props.debug);

	console.log("!!!!!!!!!!!!! RENDERING UPLOADY !!!!!!!!!!!", props);

	const inputFieldContainer = document.body;
	const inputFieldRef = useRef<?HTMLInputElement>(null);

	const uploader = useMemo<UploaderType>(() => {
		return props.uploader || createUploader(getUploaderOptions(props));
	}, [props.uploader]);

	//TODO: ALLOW TO CHANGE DESTINATION USING PROPS !!!!!!!!!!
	//TODO: ALLOW TO SET INPUT FIELD CONTAINER : props.inputFieldContainer

	const api = useMemo(() =>
		createContextApi(uploader, inputFieldRef), [uploader, inputFieldRef]);

	//TODO: FILE INPUT ATTRS  TO USE !!!!!!!!!
	// accept - https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#accept
	// capture - https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#capture
	// webkitdirectory - https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/webkitdirectory

	const onFileInputChange = useCallback((e) => {
		uploader.add(e.target.files);
	}, []);

	const registerEventListener = (([name, cb]) => {
		uploader.on(name, cb);
	});

	const unregisterEventListener = (([name, cb]) => {
		uploader.off(name, cb);
	});

	useEffect(() => {
		const listeners: Object = props.listeners;

		if (props.listeners) {
			logger.debugLog("settings listeners", listeners);

			Object.entries(listeners)
				.forEach(registerEventListener);
		}

		return () => {
			if (props.listeners) {
				Object.entries(props.listeners)
					.forEach(unregisterEventListener);
			}
		}
	}, [props.listeners]);

	const uploaderOptions = uploader.getOptions();

	return <UploadyContext.Provider value={api}>
		<FileInputFieldPortal container={inputFieldContainer}>
			<input type="file"
			       onChange={onFileInputChange}
			       name={uploaderOptions.inputFieldName}
			       multiple={uploaderOptions.multiple}
			       style={{ display: "none" }}
			       ref={inputFieldRef}/>
		</FileInputFieldPortal>

		{props.children}
	</UploadyContext.Provider>;
};

export default Uploady;