// @flow
import { DEFAULT_OPTIONS } from "./defaults";

import type { MandatoryChunkedOptions, ChunkedOptions } from "./types";

const getMandatoryOptions = (options: ?ChunkedOptions): MandatoryChunkedOptions => {
	return {
		...DEFAULT_OPTIONS,
		...options,
	};
};

let sliceMethod = null;

const isChunkingSupported = (): boolean => {
	sliceMethod = null;
	if ("Blob" in window) {
		sliceMethod = Blob.prototype.slice ||
			Blob.prototype.webkitSlice ||
			Blob.prototype.mozSlice;
	}

	return !!sliceMethod;
};

const CHUNKING_SUPPORT = isChunkingSupported();

const getChunkDataFromFile = (file: File, start: number, end: number): Blob => {
	const blob = sliceMethod?.call(file, start, end, file.type);
	blob.name = file.name;
	blob.lastModified = file.lastModified;
	return blob;
};

export {
	CHUNKING_SUPPORT,
	getMandatoryOptions,
	isChunkingSupported, //for tests
	getChunkDataFromFile,
};