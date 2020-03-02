// @flow

import { useState } from "react";
import { isFunction } from "@rpldy/shared";
import { useBatchStartListener } from "@rpldy/shared-ui";
import { PREVIEW_TYPES } from "./consts";
import { getWithMandatoryOptions, getFallbackUrl } from "./utils";

import type { Batch, BatchItem } from "@rpldy/shared";
import type {
    // MandatoryPreviewOptions,
    PreviewComponentPropsOrMethod,
    PreviewData,
    PreviewProps,
    PreviewType
} from "./types";

const getFileObjectUrlByType = (type: PreviewType, mimeTypes, max, file: Object) => {
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

const getFilePreviewUrl = (file, options: PreviewProps) => {
    let data;

    data = getFileObjectUrlByType(PREVIEW_TYPES.IMAGE, options.imageMimeTypes, options.maxPreviewImageSize, file);

    if (!data) {
        data = getFileObjectUrlByType(PREVIEW_TYPES.VIDEO, options.videoMimeTypes, options.maxPreviewVideoSize, file);
    }

    return data;
};


const loadPreviewData = (
    item: BatchItem,
    options: PreviewProps,
    previewComponentProps: PreviewComponentPropsOrMethod): ?PreviewData => {

    let data, props;

    if (item.file) {
        const file = item.file;
        data = getFilePreviewUrl(item.file, options);

        if (!data) {
            data = getFallbackUrl(options.fallbackUrl, file);
        }
    } else {
        data = {
            url: item.url,
            type: PREVIEW_TYPES.IMAGE,
        };
    }

    if (data) {
        props = isFunction(previewComponentProps) ?
            previewComponentProps(item, data.url, data.type) :
            previewComponentProps;
    }

    return data && {
        ...data,
        props
    };
};

export default (props: PreviewProps): PreviewData[] => {
    const [previews, setPreviews] = useState<PreviewData[]>([]);
    const previewOptions = getWithMandatoryOptions(props);

    useBatchStartListener((batch: Batch) => {
        const items: BatchItem[] = previewOptions.loadFirstOnly ? batch.items.slice(0, 1) : batch.items;

        const previewsData = items
            .map((item) => loadPreviewData(item, previewOptions, props.previewComponentProps))
            .filter(Boolean);

        setPreviews(previewsData);
    });

    return previews;
};

