// @flow
import * as React from "react";
import UploadButton from "./src/UploadButton";
import Uploady, {
	UPLOADER_EVENTS,
	useFileFinishListener,
	useBatchStartListener,
	useFileProgressListener
} from "@rpldy/uploady";

// import readme from '../README.md';

// $FlowFixMe
const uploadUrl = `https://api.cloudinary.com/v1_1/${process.env.CLD_CLOUD}/upload`;

const uploadParams = {
	upload_preset: process.env.CLD_PRESET, //"uw_unsigned",
	folder: process.env.CLD_TEST_FOLDER, //"rupy-tests"
};

const cloudinaryDestination = { url: uploadUrl, params: uploadParams };

export const Simple = () => <Uploady
debug
                                     destination={cloudinaryDestination}>
	<UploadButton/>
</Uploady>;

export const WithEventListeners = () => <Uploady
debug
                                                 destination={cloudinaryDestination}
                                                 listeners={{
	                                                 [UPLOADER_EVENTS.BATCH_START]: (batch) => console.log(">>>>> BATCH START - ", batch),
	                                                 [UPLOADER_EVENTS.BATCH_FINISH]: (batch) => console.log(">>>>> BATCH FINISH - ", batch),
	                                                 [UPLOADER_EVENTS.FILE_START]: (file) => console.log(">>>>>> FILE START - ", file),
	                                                 [UPLOADER_EVENTS.FILE_FINISH]: (file) => console.log(">>>>>> FILE FINISH - ", file),
                                                 }}>
	<UploadButton/>
</Uploady>;

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

export const withEventHooks = () =>
	<Uploady
debug
	         multiple
	         destination={cloudinaryDestination}>
		<HookedUploadButton/>
	</Uploady>;

const UploadProgress = () => {
	const [completed, setCompleted] = React.useState({});
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
			.map(([id, progress: number[]]): React.Element<'p'> =>
				// $FlowFixMe
				<p key={id}>{id} - {progress.join(", ")}</p>)}
	</div>;
};

export const WithProgress = () => <>
	<Uploady
debug
	         multiple={false}
	         destination={cloudinaryDestination}>
		<UploadProgress/>
		<UploadButton/>
	</Uploady>
</>;

export default {
	component: UploadButton,
	title: "Upload Button"
};
