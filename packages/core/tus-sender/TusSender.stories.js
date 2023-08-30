// @flow
import React, { useCallback, useEffect, useRef } from "react";
import { logger } from "@rpldy/shared";
import createUploader, { composeEnhancers } from "@rpldy/uploader";
import { useStoryUploadySetup, DESTINATION_TYPES, getCsfExport, type CsfExport } from "../../../story-helpers";
import getTusEnhancer from "./src";
import readme from "./README.md";

import type { Element } from "react";
import type { UploadyUploaderType } from "@rpldy/uploader";
import type { TusOptions } from "./src";

logger.setDebug(true);

const useUploaderWithTus = (tusOptions: TusOptions = {}) => {
	const uploaderRef = useRef<?UploadyUploaderType>(null);

	const { enhancer, destination, destinationType } = useStoryUploadySetup({
		noGroup: true,
		destinations: [DESTINATION_TYPES.url, DESTINATION_TYPES.local],
		noLong: true,
	});

	useEffect(() => {
		const tusEnhancer = getTusEnhancer(tusOptions);

		uploaderRef.current = createUploader({
			enhancer: enhancer ? composeEnhancers(enhancer, tusEnhancer) : tusEnhancer,
			destination,
			params: {
				source: "rpldy",
				test: "storybook"
			}
		});
	}, [enhancer, destination, destinationType]);

	return uploaderRef;
};

export const WithTusSender = (): Element<"div"> => {
	const inputRef = useRef<?HTMLInputElement>(null);
	const uploaderRef = useUploaderWithTus();

	const onClick = useCallback(() => {
		const input = inputRef.current;
		if (input) {
			input.value = "";
			input.click();
		}
	}, []);

	const onInputChange = useCallback(() => {
		uploaderRef.current?.add(inputRef.current?.files);
	}, []);

	return <div>
		<p>Uses Uploader & TUS Sender</p>
		<input type="file" ref={inputRef} style={{ display: "none" }} onChange={onInputChange}/>
		<button id="upload-button" onClick={onClick}>Upload with TUS</button>
	</div>
};

export const WithTusDataOnCreate = (): Element<"div"> => {
	const inputRef = useRef<?HTMLInputElement>(null);
	const uploaderRef = useUploaderWithTus({ sendDataOnCreate: true });

	const onClick = useCallback(() => {
		const input = inputRef.current;
		if (input) {
			input.value = "";
			input.click();
		}
	}, []);

	const onInputChange = useCallback(() => {
		uploaderRef.current?.add(inputRef.current?.files);
	}, []);

	return <div>
		<p>Uses Uploader & TUS Sender with data on create</p>
		<input type="file" ref={inputRef} style={{ display: "none" }} onChange={onInputChange}/>
		<button id="upload-button" onClick={onClick}>Upload with TUS</button>
	</div>
};

export const WithTusConcatenation = (): Element<"div"> => {
	const inputRef = useRef<?HTMLInputElement>(null);
	const uploaderRef = useUploaderWithTus({ parallel: 2 });

	const onClick = useCallback(() => {
		const input = inputRef.current;
		if (input) {
			input.value = "";
			input.click();
		}
	}, []);

	const onInputChange = useCallback(() => {
		uploaderRef.current?.add(inputRef.current?.files);
	}, []);

	return <div>
		<p>Uses Uploader & TUS Sender with data on create</p>
		<input type="file" ref={inputRef} style={{ display: "none" }} onChange={onInputChange}/>
		<button id="upload-button" onClick={onClick}>Upload with TUS</button>
	</div>
};

export const WithFeatureDetection = (): Element<"div"> => {
	const inputRef = useRef<?HTMLInputElement>(null);
	const uploaderRef = useUploaderWithTus({
		featureDetection: true,
		onFeaturesDetected: (extensions) => {
			return ~extensions.indexOf("concatenation") ?
				{ parallel: 2 } :
				null;
		}
	});

	const onClick = useCallback(() => {
		const input = inputRef.current;
		if (input) {
			input.value = "";
			input.click();
		}
	}, []);

	const onInputChange = useCallback(() => {
		uploaderRef.current?.add(inputRef.current?.files);
	}, []);

	return <div>
		<p>Uses Uploader & TUS Sender with server feature detection</p>
		<input type="file" ref={inputRef} style={{ display: "none" }} onChange={onInputChange}/>
		<button id="upload-button" onClick={onClick}>Upload with TUS</button>
	</div>
};


const tusSenderStories: CsfExport = getCsfExport(undefined, "TUS Sender", readme, { pkg: "tus-sender", section: "Core" });

export default { ...tusSenderStories, title: "Core/TUS Sender" };
