// @flow
import React, { useMemo } from "react";
import Uploady from "@rpldy/uploady";
import { CHUNKING_SUPPORT } from "./utils";
import getChunkedSend from "./chunkedSender";

import type { UploaderType, UploaderEnhancer } from "@rpldy/uploader";
import type { ChunkedUploadyProps } from "./types";

const getEnhancer = (chunkedSend, enhancer: UploaderEnhancer) => {
	return (uploader: UploaderType): UploaderType => {
		uploader.update({ send: chunkedSend });
		return enhancer ? enhancer(uploader) : uploader;
	};
};

const ChunkedUploady = (props: ChunkedUploadyProps) => {
	const { chunked, chunkSize, retry, parallel, ...UploadyProps } = props;

	const chunkedSend = useMemo(
		() => getChunkedSend({ chunked, chunkSize, retry, parallel }),
		[
			chunked,
			chunkSize,
			retry,
			parallel
		]);

	const enhancer = useMemo(
		() => getEnhancer(chunkedSend, props.enhancer),
		[chunkedSend, props.enhancer]);

	return <Uploady {...UploadyProps} enhancer={enhancer}/>;
};

const exportedUploady = CHUNKING_SUPPORT ? ChunkedUploady : Uploady;

export default exportedUploady;

