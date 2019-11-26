import React from "react";
import UploadButton from "./UploadButton";
import Uploady from "@rupy/uploady";

// import readme from '../README.md';


const uploadUrl = "https://api.cloudinary.com/v1_1/yoav-cloud/upload";

const uploadParams = {
	upload_preset: "uw_unsigned",
	folder: "rupy-tests"
};

export const Simple = () => <>
	<Uploady destination={{url: uploadUrl, params: uploadParams}}>
		<UploadButton/>
	</Uploady>
</>;

// const UploadProgress = () => {
// 	const []
// };

export const WithProgress = () => <>
	<Uploady destination={{url: uploadUrl, params: uploadParams}}>
		<UploadButton/>
	</Uploady>
</>;


export default {
	component: UploadButton,
	title: "UploadButton"
};
