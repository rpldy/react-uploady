// @flow
import React, { useCallback } from "react";
import Uploady from "@rpldy/uploady";
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

	const chunkedSend = useCallback(
		() => getChunkedSend({ chunked, chunkSize, retry, parallel }),
		[
			chunked,
			chunkSize,
			retry,
			parallel
		]);

	const enhancer = useCallback(
		() => getEnhancer(chunkedSend, enhancer),
		[chunkedSend, props.enhancer]);

	return <Uploady {...UploadyProps} enhancer={enhancer}/>;
};

export default ChunkedUploady;

