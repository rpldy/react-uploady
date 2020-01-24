// @flow
import { DEFAULT_OPTIONS } from "./defaults";

import type { MandatoryChunkedOptions, ChunkedOptions } from "./types";

const getMandatoryOptions = (options: ?ChunkedOptions): MandatoryChunkedOptions => {
	return {
		...DEFAULT_OPTIONS,
		...options,
	};
};

export {
	getMandatoryOptions,
};