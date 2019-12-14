// @flow
import React, { useRef, useState } from "react";
import { withKnobs, boolean } from "@storybook/addon-knobs";
import styled, { css } from "styled-components";
import Uploady, {
	useFileProgressListener,
	useBatchFinishListener,
	useBatchStartListener,
} from "@rpldy/uploady";
import UploadButton from "@rpldy/upload-button";
import UploadUrlInput from "@rpldy/upload-url-input";
import { createMockSender } from "@rpldy/sender";
import Preview from "./index";

import type { UploaderType } from "@rpldy/uploader";

const mockSenderEnhancer = (uploader: UploaderType): UploaderType => {
	const mockSender = createMockSender({ delay: 1000 });
	uploader.update({ send: mockSender.send });
	return uploader;
};

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
		
		${({ completed }) => `opacity: ${completed / 100};`}
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
	<Uploady
		debug
		destination={cloudinaryDestination}
		enhancer={mockSenderEnhancer}>

		<StyledUploadButton/>

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
		<StyledUploadUrlInput
			placeholder="enter valid url to upload"
			uploadRef={uploadRef}/>

		<Button onClick={onButtonClick}>Upload</Button>
	</>;
};

export const WithUrls = () => {
	return <Uploady
		debug
		destination={cloudinaryDestination}
		enhancer={mockSenderEnhancer}>

		<UrlUpload/>

		<PreviewContainer>
			<Preview/>
		</PreviewContainer>
	</Uploady>;
};

export const withFallbackUrl = () => {
	const value = boolean("Use Mock Sender", true);

	return <Uploady
		debug
		destination={cloudinaryDestination}
		enhancer={value ? mockSenderEnhancer : undefined}>

		<UrlUpload/>

		<PreviewContainer>
			<Preview
				fallbackUrl={"https://icon-library.net/images/image-placeholder-icon/image-placeholder-icon-6.jpg"}/>
		</PreviewContainer>
	</Uploady>;
};

const PreviewWithProgress = () => {
	const [isDone, setIsDone] = useState(false);
	const fileProgress = useFileProgressListener();

	useBatchStartListener(()=>{
		setIsDone(false);
	});

	useBatchFinishListener(()=>{
		setIsDone(true);
	});

	const completed = isDone ? 100 :
		(fileProgress && fileProgress.completed || 0);

	return <PreviewContainer completed={completed}>
		<Preview
			fallbackUrl={"https://icon-library.net/images/image-placeholder-icon/image-placeholder-icon-6.jpg"}/>
	</PreviewContainer>;
};

export const withProgress = () => {
	const value = boolean("Use Mock Sender", true);

	return <Uploady
		debug
		destination={cloudinaryDestination}
		enhancer={value ? mockSenderEnhancer : undefined}>

		<UrlUpload/>
		<PreviewWithProgress/>
	</Uploady>;
};

export default {
	component: Preview,
	title: "Preview",
	decorators: [withKnobs],
};
