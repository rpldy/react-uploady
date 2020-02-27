// @flow
import { PREVIEW_DEFAULTS } from "./defaults";

import type { MandatoryPreviewOptions, PreviewOptions } from "./types";

const getMandatoryOptions = (options: ?PreviewOptions): MandatoryPreviewOptions => {
	return {
		...PREVIEW_DEFAULTS,
		...options,
	};
};

export {
	getMandatoryOptions,
};