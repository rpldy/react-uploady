// @flow
import { DEFAULT_OPTIONS } from "./defaults";

import type { MandatoryChunkedOptions, ChunkedOptions } from "./types";

const getMandatoryOptions = (options: ?ChunkedOptions): MandatoryChunkedOptions => {
	return {
		...DEFAULT_OPTIONS,
		...options,
	};
};

const isChunkingSupported = (): boolean =>
	"Blob" in window &&
	!!(Blob.prototype.slice ||
		Blob.prototype.webkitSlice ||
		Blob.prototype.mozSlice);


const CHUNKING_SUPPORT = isChunkingSupported();

export {
	CHUNKING_SUPPORT,
	getMandatoryOptions,
	isChunkingSupported, //for tests
};