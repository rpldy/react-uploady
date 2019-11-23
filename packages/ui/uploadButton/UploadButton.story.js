import React from "react";
import UploadButton from "./UploadButton";
import Uploady from "@rupy/uploady";

// import readme from '../README.md';

export const Simple = () => <>
	<Uploady>
		<UploadButton/>
	</Uploady>
</>;

const UploadProgress = () => {
	const []
};

export const WithProgress = () => <>
	<Uploady>
		<UploadButton/>
	</Uploady>
</>;


export default {
	component: UploadButton,
	title: "UploadButton"
};
