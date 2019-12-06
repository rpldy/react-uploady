// @flow
import React from "react";
import styled from "styled-components";
import Uploady, {} from "@rupy/uploady";
import Preview from "./index";
import UploadButton from "@rupy/upload-button";

// $FlowFixMe
const uploadUrl = `https://api.cloudinary.com/v1_1/${process.env.CLD_CLOUD}/upload`;

const uploadParams = {
	upload_preset: process.env.CLD_PRESET,
	folder: process.env.CLD_TEST_FOLDER,
};

const PreviewContainer = styled.div`
	display: flex;
	flex-wrap: wrap;
	
	img {
		margin-left: 10px;
		max-width: 200px;
		height: auto; 
	}
`;

const cloudinaryDestination = { url: uploadUrl, params: uploadParams };

export const WithLocalFiles = () =>
	<Uploady debug
	         destination={cloudinaryDestination}>

		<UploadButton/>

		<PreviewContainer>
			<Preview />
		</PreviewContainer>
	</Uploady>;

export default {
	component: Preview,
	title: "Preview"
};
