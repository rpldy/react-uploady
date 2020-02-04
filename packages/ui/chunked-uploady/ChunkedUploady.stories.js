// @flow
import React, { Component, useMemo, useState, useContext } from "react";
import { number } from "@storybook/addon-knobs"
import UploadButton from "@rpldy/upload-button";
import ChunkedUploady from "./src"
import {
	withKnobs,
	useStoryUploadySetup,
} from "../../../story-helpers";

export const Simple = () => {
	const { enhancer, destination, multiple } = useStoryUploadySetup({ noGroup: true });
	const chunkSize = number("chunk size (KB)", 5000);

	return <ChunkedUploady
		debug
		multiple={multiple}
		destination={destination}
		enhancer={enhancer}
		chunkSize={(chunkSize * 1000)}>
		<UploadButton/>
	</ChunkedUploady>;
};


export default {
	component: UploadButton,
	title: "Chunked Uploady",
	decorators: [withKnobs],
};
