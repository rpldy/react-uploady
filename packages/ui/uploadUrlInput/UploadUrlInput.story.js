// @flow
import React, { useRef, useState } from "react";
import UploadUrlInput from "./index";
import Uploady, {
	useBatchStartListener,
	useBatchFinishListener,
} from "@rupy/uploady";

// $FlowFixMe
const uploadUrl = `https://api.cloudinary.com/v1_1/${process.env.CLD_CLOUD}/upload`;

const uploadParams = {
	upload_preset: process.env.CLD_PRESET,
	folder: process.env.CLD_TEST_FOLDER,
};

const cloudinaryDestination = { url: uploadUrl, params: uploadParams };

export const Simple = () => <Uploady
debug
                                     destination={cloudinaryDestination}>
	<UploadUrlInput placeholder="URL to upload"/>
</Uploady>;

const UploadStatus = () => {
	const [status, setStatus] = useState("Pending");

	useBatchStartListener(() => {
		setStatus("Uploading");
	});

	useBatchFinishListener(() => {
		setStatus("Finished");
	});

	return <p>{status}</p>;
};

export const WithButtonAndValidate = () => {
	const [error, setError] = useState(null);
	const uploadRef = useRef(null);

	return <Uploady
debug
	                destination={cloudinaryDestination}>

		<UploadUrlInput
uploadRef={uploadRef}
		                validate={(value) => {
			                const valid = !!(value && !value.indexOf("http"));
			                setError(valid ? null : "URL must be valid http address");
			                return valid;
		                }}
		                placeholder="URL to upload"/>
		{error && <span style={{ color: "red" }}>{error}</span>}
		<br/>
		<button onClick={() => {
			if (uploadRef && uploadRef.current) {
				uploadRef.current();
			}
		}}>Upload
		</button>
		<br/>
		<UploadStatus/>
	</Uploady>;
};

export default {
	component: UploadUrlInput,
	title: "Upload Url Input"
};

