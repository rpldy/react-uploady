// @flow
import React, { Component, useMemo } from "react";
import { withKnobs } from "@storybook/addon-knobs";
import UploadButton from "./src";
import Uploady, {
	UPLOADER_EVENTS,
	useFileFinishListener,
	useBatchStartListener,
} from "@rpldy/uploady";

// import readme from '../README.md';

import {
	useStoryUploadySetup,
	StoryUploadProgress,
} from "../../../story-helpers";

export const Simple = () => {
	const { enhancer, destination, multiple } = useStoryUploadySetup();

	return <Uploady debug
	                multiple={multiple}
	                destination={destination}
	                enhancer={enhancer}>
		<UploadButton/>
	</Uploady>;
};


export const WithEventListeners = () => {
	const { enhancer, destination, multiple } = useStoryUploadySetup();

	const listeners = useMemo(() => ({
		[UPLOADER_EVENTS.BATCH_START]: (batch) =>
			console.log(`>>>>> BATCH START - ${batch.id}`),
		[UPLOADER_EVENTS.BATCH_FINISH]: (batch) =>
			console.log(`>>>>> BATCH FINISH - ${batch.id}`),
		[UPLOADER_EVENTS.FILE_START]: (file) =>
			console.log(`>>>>> FILE START - ${file.id}`),
		[UPLOADER_EVENTS.FILE_FINISH]: (file) =>
			console.log(`>>>>> FILE FINISH - ${file.id}`),
	}), []);

	return <Uploady
		debug
		multiple={multiple}
		destination={destination}
		enhancer={enhancer}
		listeners={listeners}>
		<UploadButton/>
	</Uploady>;
};

const HookedUploadButton = () => {
	useFileFinishListener((file) => {
		console.log(">>>>>> (hook) FILE FINISH - ", file);
	});

	useBatchStartListener((batch) => {
		console.log(">>>>> (hook) BATCH START - ", batch);

		const item = batch.items[0];

		if (item.file) {
			console.log(item.file);
		}
	});

	return <UploadButton/>;
};

export const withEventHooks = () => {
	const { enhancer, destination, multiple } = useStoryUploadySetup();

	return <Uploady
		debug
		multiple={multiple}
		destination={destination}
		enhancer={enhancer}>
		<HookedUploadButton/>
	</Uploady>;
};

export const WithProgress = () => {
	const { enhancer, destination, multiple } = useStoryUploadySetup();

	return <Uploady
		debug
		multiple={multiple}
		destination={destination}
		enhancer={enhancer}>
		<StoryUploadProgress/>
		<UploadButton/>
	</Uploady>;
};

// export class WithClass extends Component<any> {
//
// 	componentDidMount(): * {
//
// 	}
//
// 	// static contex
//
// 	render() {
// 		return (
// 			<div>
//
// 			</div>
// 		);
// 	}
// }


export default {
	component: UploadButton,
	title: "Upload Button",
	decorators: [withKnobs],
};
