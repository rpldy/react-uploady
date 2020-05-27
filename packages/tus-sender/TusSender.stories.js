// @flow
import React, { useCallback, useEffect, useRef } from "react";
import { withKnobs } from "@storybook/addon-knobs";
import { logger } from "@rpldy/shared";
import createUploader, { composeEnhancers } from "@rpldy/uploader";
import { useStoryUploadySetup, DESTINATION_TYPES } from "../../story-helpers";
import getTusEnhancer from "./src";

// $FlowFixMe - doesnt understand loading readme
import readme from "./README.md";

logger.setDebug(true);

const useUploaderWithTus = (tusOptions = {}) => {
	const uploaderRef = useRef(null);

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

export const WithTusSender = () => {
	const inputRef = useRef(null);
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

export const WithTusDataOnCreate = () => {
	const inputRef = useRef(null);
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

export const WithTusConcatenation = () => {
	const inputRef = useRef(null);
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

export const WithFeatureDetection = () => {
	const inputRef = useRef(null);
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

// export const WithTusJsClient  = () => {
//     const inputRef = useRef();
//
//     const onInputChange = useCallback(() => {
//
//         const upload = new Tus(inputRef.current?.files[0], {
//             endpoint: "http://localhost:4000/upload",
//             chunkSize: 5242880,
//
//             onError: error => {
//                 console.log("Failed because: ", error);
//             },
//
//             onSuccess: () => {
//                 console.log("Success", upload);
//             }
//         });
//
//         upload.start();
//
//     }, []);
//
//     return <div>
//         <p>Uses TUS JS Client</p>
//         <input type="file" ref={inputRef} onChange={onInputChange}/>
//     </div>
// };

export default {
	title: "TUS Sender",
	decorators: [withKnobs],
	parameters: {
		readme: {
			sidebar: readme,
		},
		options: {
			showPanel: true,
			//needed until storybook-readme fixes their bug - https://github.com/tuchk4/storybook-readme/issues/221
			theme: {}
		},
	},
};

