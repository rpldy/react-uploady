// @flow
import { isFunction } from "@rpldy/shared";
import { PREVIEW_TYPES } from "./consts";
import { PREVIEW_DEFAULTS } from "./defaults";

import type { FallbackMethod, MandatoryPreviewOptions, PreviewData, PreviewOptions } from "./types";

const getMandatoryOptions = (options: ?PreviewOptions): MandatoryPreviewOptions => {
	return {
		...PREVIEW_DEFAULTS,
		...options,
	};
};

const getFallbackUrl = (fallbackProp: ?string | FallbackMethod, file: Object): ?PreviewData => {
    let data = isFunction(fallbackProp) ?
        fallbackProp(file) :
        fallbackProp;

    if (typeof data === "string") {
        data = {
            url: data,
            type: PREVIEW_TYPES.IMAGE,
        };
    }

    return data;
};

export {
	getMandatoryOptions,
    getFallbackUrl,
};
