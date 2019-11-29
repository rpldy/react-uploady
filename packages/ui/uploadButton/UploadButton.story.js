import React from "react";
import UploadButton from "./UploadButton";
import Uploady, { UPLOADER_EVENTS, useFileFinishListener } from "@rupy/uploady";
import { useBatchStartListeneer } from "@rupy/shared-ui";

// import readme from '../README.md';


const uploadUrl = "https://api.cloudinary.com/v1_1/yoav-cloud/upload";
// const uploadUrl = "https://api-dev.cloudinary.com/v1_1/yoav/upload";

const uploadParams = {
	upload_preset: "uw_unsigned",
	folder: "rupy-tests"
};

const cloudinaryDestination = { url: uploadUrl, params: uploadParams };

export const Simple = () => <>
	<Uploady debug
	         destination={cloudinaryDestination}>
		<UploadButton/>
	</Uploady>
</>;

export const WithEventListeners = () => <>
	<Uploady debug
	         destination={cloudinaryDestination}
	         listeners={{
		         [UPLOADER_EVENTS.BATCH_START]: (batch) => console.log(">>>>> BATCH START - ", batch),
		         [UPLOADER_EVENTS.BATCH_FINISH]: (batch) => console.log(">>>>> BATCH FINISH - ", batch),
		         [UPLOADER_EVENTS.FILE_START]: (file) => console.log(">>>>>> FILE START - ", file),
		         [UPLOADER_EVENTS.FILE_FINISH]: (file) => console.log(">>>>>> FILE FINISH - ", file),
	         }}>
		<UploadButton/>
	</Uploady>
</>;

const HookedUploadButton = () => {

	useFileFinishListener((file) => {
		console.log(">>>>>> (hook) FILE FINISH - ", file);
	});

	useBatchStartListeneer((batch) => {
		console.log(">>>>> BATCH START - ", batch);
	});

	return <UploadButton/>;
};

export const withEventHooks = () => {
	return <>
		<Uploady debug
		         destination={cloudinaryDestination}>
			<HookedUploadButton/>
		</Uploady>
	</>;
};

// const UploadProgress = () => {
// 	const []
// };

export const WithProgress = () => <>
	<Uploady destination={cloudinaryDestination}>
		<UploadButton/>
	</Uploady>
</>;


export default {
	component: UploadButton,
	title: "UploadButton"
};
