// @flow
import React, { useMemo, useRef, useCallback, useEffect } from "react";
import ReactDOM from "react-dom";
import createUploader from "@rupy/uploader";
import { logger } from "@rupy/shared";
import { UploadyContext, createContextApi } from "@rupy/shared-ui";

import type { Destination, UploaderType } from "@rupy/shared";
import type { UploadyProps } from "../types";

const FileInputFieldPortal = ({ container, children }) =>
	container && ReactDOM.createPortal(children, container);

const Uploady = (props: UploadyProps) => {

	console.log("!!!!!!!!!!!!! RENDERING UPLOADY !!!!!!!!!!!");

	const inputFieldContainer = document.body;
	const inputFieldRef = useRef<?HTMLInputElement>(null);

	const uploader = useMemo<UploaderType>(() => {
		return props.uploader || createUploader({
			destination: props.destination,
		});
	}, [props.uploader]);

	//TODO: ALLOW TO CHANGE DESTINATION USING PROPS !!!!!!!!!!
	//TODO: ALLOW TO SET INPUT FIELD CONTAINER : props.inputFieldContainer

	// const getInputField = () => {
	// 	console.log("!!!!!!!!! UPLOADY - INPUT FIELD REF = ", inputFieldRef.current);
	// 	return inputFieldRef.current;
	// };
	// const showFileUpload =

	const api = useMemo(() =>
		createContextApi(uploader, inputFieldRef), [uploader, inputFieldRef]);

	//TODO: FILE INPUT ATTRS  TO USE !!!!!!!!!
	// accept - https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#accept
	// multiple
	// capture - https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#capture
	// webkitdirectory - https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/webkitdirectory

	const onFileInputChange = useCallback((e) => {
		logger.debugLog("!!!!!!!!!! UPLOADY - FILE INPUT CHANGE !!!!", e);
		uploader.add(e.target.files); //TODO !!!!!!!!!!!!!! add selected files to uploader
	}, []);

	useEffect(() => {
		logger.setDebug(!!props.debug);
	}, [props.debug]);

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

	return <UploadyContext.Provider value={api}>
		<FileInputFieldPortal container={inputFieldContainer}>
			<input type="file"
			       onChange={onFileInputChange}
			       name={props.inputFieldName || "file"}
			       style={{ display: "none" }}
			       ref={inputFieldRef}/>
		</FileInputFieldPortal>

		{props.children}
	</UploadyContext.Provider>;
};

export default Uploady;