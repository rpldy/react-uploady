// @flow
import { isFunction } from "@rpldy/shared";
import { PREVIEW_TYPES } from "./consts";
import { PREVIEW_DEFAULTS } from "./defaults";

import type {
    FallbackMethod,
    // MandatoryPreviewOptions,
    PreviewProps
} from "./types";

const getWithMandatoryOptions = (props: ?PreviewProps): PreviewProps => {
	return {
		...PREVIEW_DEFAULTS,
		...props,
	};
};

const getFallbackUrl = (fallbackProp: ?string | FallbackMethod, file: Object) => {
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
    getWithMandatoryOptions,
    getFallbackUrl,
};
