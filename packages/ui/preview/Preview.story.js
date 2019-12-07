// @flow
import React, { useRef } from "react";
import styled, { css } from "styled-components";
import Uploady, {} from "@rupy/uploady";
import Preview from "./index";
import UploadButton from "@rupy/upload-button";
import UploadUrlInput from "@rupy/upload-url-input";

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

const uploadButtonCss = css`
	width: 100px;
	height: 50px;
	background-color: #1d724d;
	color: #fff;
	font-size: 20px;
	display: block;
	margin: 10px 0;
`;

const StyledUploadButton = styled(UploadButton)`
	${uploadButtonCss}
`;

const StyledUploadUrlInput = styled(UploadUrlInput)`
	width: 300px;
	font-size: 18px;
	line-height: 20px;
	height: 20px;
`;

const Button = styled.button`
	${uploadButtonCss}
`;

const cloudinaryDestination = { url: uploadUrl, params: uploadParams };

export const WithLocalFiles = () =>
	<Uploady debug
	         destination={cloudinaryDestination}>

		<StyledUploadButton />

		<PreviewContainer>
			<Preview/>
		</PreviewContainer>
	</Uploady>;

const UrlUpload = () => {
	const uploadRef = useRef(null);

	const onButtonClick = () => {
		if (uploadRef.current) {
			uploadRef.current();
		}
	};

	return <>
		<StyledUploadUrlInput placeholder="enter valid url to upload"
		                      uploadRef={uploadRef}/>

		<Button onClick={onButtonClick}>Upload</Button>
	</>
};

export const WithUrls = () => {

	return <Uploady debug
	                destination={cloudinaryDestination}>

		<UrlUpload />

		<PreviewContainer>
			<Preview/>
		</PreviewContainer>
	</Uploady>;
};

export const withFallbackUrl = () =>
	<Uploady debug
	         destination={cloudinaryDestination}>

		<UrlUpload />

		<PreviewContainer>
			<Preview
				fallbackUrl={"https://icon-library.net/images/image-placeholder-icon/image-placeholder-icon-6.jpg"} />
		</PreviewContainer>
	</Uploady>;

export default {
	component: Preview,
	title: "Preview"
};
