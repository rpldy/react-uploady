// @flow
import { isFunction } from "@rpldy/shared";
import { PREVIEW_TYPES } from "./consts";
import { PREVIEW_DEFAULTS } from "./defaults";

import type {
    FallbackMethod,
    PreviewType,
    MandatoryPreviewOptions,
    PreviewOptions,
} from "./types";

const getWithMandatoryOptions = (options: ?PreviewOptions): MandatoryPreviewOptions => {
	return {
		...PREVIEW_DEFAULTS,
		...options,
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

const getFileObjectUrlByType = (type: PreviewType, mimeTypes: string[], max: number, file: Object) => {
    let data;

    if (mimeTypes && ~mimeTypes.indexOf(file.type)) {
        if (!max || file.size <= max) {
            data = {
                url: URL.createObjectURL(file),
                type,
            };
        }
    }

    return data;
};
export {
    getWithMandatoryOptions,
    getFallbackUrl,
    getFileObjectUrlByType,
};
