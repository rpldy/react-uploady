// @flow
import React from "react";
// $FlowFixMe - for some reason flow doesnt see @storybook/addon-knobs is installed...
import { number } from "@storybook/addon-knobs"
import UploadButton from "@rpldy/upload-button";
import ChunkedUploady, { useRequestPreSend } from "./src"
import {
	withKnobs,
	useStoryUploadySetup,
	StoryUploadProgress,
} from "../../../story-helpers";

const UploadButtonWithUniqueIdHeader = () => {
	useRequestPreSend((data) => {
		return {
			options: {
				destination: {
					...data.options.destination,
					headers: {
						...data.options.destination.headers,
						"X-Unique-Upload-Id": `rpldy-chunked-uploader-${Date.now()}`,
					}
				}
			}
		}
	});

	return <UploadButton/>
};

export const Simple = () => {
	const { enhancer, destination, multiple } = useStoryUploadySetup({ noGroup: true });
	const chunkSize = number("chunk size (bytes)", 5242880);

	return <ChunkedUploady
		debug
		multiple={multiple}
		destination={destination}
		enhancer={enhancer}
		chunkSize={chunkSize}>
		<UploadButtonWithUniqueIdHeader/>
	</ChunkedUploady>;
};

export const WithProgress = () => {
	const { enhancer, destination, multiple } = useStoryUploadySetup({ noGroup: true });
	const chunkSize = number("chunk size (bytes)", 5242880);

	return <ChunkedUploady
		debug
		multiple={multiple}
		destination={destination}
		enhancer={enhancer}
		chunkSize={chunkSize}>
		<StoryUploadProgress/>
		<UploadButtonWithUniqueIdHeader/>
	</ChunkedUploady>;
};


export default {
	component: UploadButton,
	title: "Chunked Uploady",
	decorators: [withKnobs],
};
