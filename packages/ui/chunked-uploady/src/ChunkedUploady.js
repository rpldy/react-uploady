// @flow
import React, { useMemo } from "react";
import warning from "warning";
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

const definedOnly = (props: Object) =>
	Object.keys(props)
		.reduce((res, name) => {
			if (typeof props[name] !== "undefined") {
				res[name] = props[name];
			}
			return res;
		}, {});

const ChunkedUploady = (props: ChunkedUploadyProps) => {
	const { chunked, chunkSize, retries, parallel, ...UploadyProps } = props;

	const chunkedSend = useMemo(
		() => {
			const chunkedOptions = definedOnly({ chunked, chunkSize, retries, parallel });
			return getChunkedSend(chunkedOptions);
		},
		[
			chunked,
			chunkSize,
			retries,
			parallel
		]);

	const enhancer = useMemo(
		() => getEnhancer(chunkedSend, props.enhancer),
		[chunkedSend, props.enhancer]);

	return <Uploady {...UploadyProps} enhancer={enhancer}/>;
};

warning(CHUNKING_SUPPORT, "This browser doesn't support chunking. Consider using @rpldy/uploady instead");

const exportedUploady = CHUNKING_SUPPORT ? ChunkedUploady : Uploady;

export default exportedUploady;

