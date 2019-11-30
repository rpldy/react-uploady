import React, { useState } from "react";
import UploadButton from "./UploadButton";
import Uploady, {
	UPLOADER_EVENTS,
	useFileFinishListener,
	useBatchStartListeneer,
	useFileProgressListener
} from "@rupy/uploady";

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
		console.log(">>>>> (hook) BATCH START - ", batch);
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

const UploadProgress = () => {
	const [completed, setCompleted] = useState({});
	const fileProgress = useFileProgressListener((item) => {
		console.log(">>>>> (hook) File Progress - ", item);
	});

	if (fileProgress && fileProgress.completed) {
		const item = completed[fileProgress.id] || [0];

		if (!~item.indexOf(fileProgress.completed)) {
			item.push(fileProgress.completed);

			setCompleted({
				...completed,
				[fileProgress.id]: item,
			});
		}
	}

	return <div>
		Upload Completed:<br/>
		{Object.entries(completed)
			.map(([id, progress]) =>
				<p key={id}>{id} - {progress.join(", ")}</p>)}
	</div>;
};

export const WithProgress = () => <>
	<Uploady debug
	         destination={cloudinaryDestination}>
		<UploadProgress/>
		<UploadButton/>
	</Uploady>
</>;

export default {
	component: UploadButton,
	title: "UploadButton"
};
