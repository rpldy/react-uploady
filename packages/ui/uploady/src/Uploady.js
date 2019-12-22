// @flow
import React, { useMemo, useRef, useCallback, useEffect, useLayoutEffect } from "react";
import ReactDOM from "react-dom";
import { pick } from "lodash";
import createUploader, { DEFAULT_OPTIONS } from "@rpldy/uploader";
import { logger } from "@rpldy/shared";
import { UploadyContext, createContextApi } from "@rpldy/shared-ui";

import type { UploaderType } from "@rpldy/uploader";
import type { CreateOptions } from "@rpldy/shared";
import type { UploadyProps } from "./types";
import type { EventCallback } from "@rpldy/life-events";

const FileInputFieldPortal = ({ container, children }) =>
	container && ReactDOM.createPortal(children, container);

const getUploaderOptions = (props: UploadyProps): CreateOptions =>
	pick(props, Object.keys(DEFAULT_OPTIONS));

const Uploady = (props: UploadyProps) => {

	logger.setDebug(!!props.debug);
	logger.debugLog("@@@ Uploady rendering @@@", props);

	const inputFieldContainer = document.body;
	const inputFieldRef = useRef<?HTMLInputElement>(null);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const uploaderOptions = useMemo(() => getUploaderOptions(props), [...Object.values(props)]);

	//avoid creating new instance of uploader unless we have to (enhancer changed or uploader instance passed)
	const uploader = useMemo<UploaderType>(() => {
		if (!props.uploader) {
			logger.debugLog("Uploady creating a new uploader instance", {
				uploaderOptions,
				enhancer: props.enhancer
			});
		}

		return props.uploader || createUploader(uploaderOptions, props.enhancer);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.enhancer, props.uploader]);

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

	useMemo(() => {
		logger.debugLog("Uploady updating uploader options", uploaderOptions);
		uploader.update(uploaderOptions);
	}, [uploader, uploaderOptions]);

	useEffect(() => {
		if (props.listeners) {
			const listeners = props.listeners;
			logger.debugLog("Uploady setting event listeners", listeners);

			Object.entries(listeners)
				.forEach(([name, m]: [string, any]) =>{
					uploader.on(name, m);
				});
		}

		return () => {
			if (props.listeners) {
				Object.entries(props.listeners)
					.forEach(([name, m]: [string, any]) =>
						uploader.off(name, m));
			}
		};
	}, [props.listeners, uploader]);

	const instanceOptions = uploader.getOptions();

	//TODO !!!!!!!!! move rendering of portal and input to memoized component !!!!!!!

	console.log("!!!!!!!!! rendering input with options: ", instanceOptions);

	return <UploadyContext.Provider value={api}>
		<FileInputFieldPortal container={inputFieldContainer}>
			<input
				type="file"
				onChange={onFileInputChange}
				name={instanceOptions.inputFieldName}
				multiple={instanceOptions.multiple}
				style={{ display: "none" }}
				ref={inputFieldRef}/>
		</FileInputFieldPortal>

		{props.children}
	</UploadyContext.Provider>;
};

export default Uploady;