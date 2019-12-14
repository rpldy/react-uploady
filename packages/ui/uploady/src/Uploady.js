// @flow
import React, { useMemo, useRef, useCallback, useEffect } from "react";
import ReactDOM from "react-dom";
import { pick } from "lodash";
import createUploader, { DEFAULT_OPTIONS } from "@rpldy/uploader";
import { logger } from "@rpldy/shared";
import { UploadyContext, createContextApi } from "@rpldy/shared-ui";

import type { UploaderType } from "@rpldy/uploader";
import type { CreateOptions } from "@rpldy/shared";
import type { UploadyProps } from "./types";

const FileInputFieldPortal = ({ container, children }) =>
	container && ReactDOM.createPortal(children, container);

const getUploaderOptions = (props: UploadyProps): CreateOptions =>
	pick(props, Object.keys(DEFAULT_OPTIONS));

const Uploady = (props: UploadyProps) => {

	logger.setDebug(!!props.debug);
	logger.debugLog("@@@ Uploady rendering @@@", props);

	const inputFieldContainer = document.body;
	const inputFieldRef = useRef<?HTMLInputElement>(null);

	const uploader = useMemo<UploaderType>(() => {
		return props.uploader || createUploader(getUploaderOptions(props), props.enhancer);
	}, [props]);

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
	}, [uploader]);

	useEffect(() => {
		const listeners: Object = props.listeners;

		if (props.listeners) {
			logger.debugLog("settings listeners", listeners);

			Object.entries(listeners)
				.forEach((args) => uploader.on(...args));
		}

		return () => {
			if (props.listeners) {
				Object.entries(props.listeners)
					.forEach((args) => uploader.off(...args));
			}
		};
	}, [props.listeners, uploader]);

	const uploaderOptions = uploader.getOptions();

	return <UploadyContext.Provider value={api}>
		<FileInputFieldPortal container={inputFieldContainer}>
			<input
				type="file"
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