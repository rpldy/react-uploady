// @flow

import { useState } from "react";
import { useBatchStartListener } from "@rpldy/shared-ui";
import { PREVIEW_TYPES } from "./consts";
import { getMandatoryOptions, getFallbackUrl } from "./utils";

import type { Batch, BatchItem } from "@rpldy/shared";
import type { MandatoryPreviewOptions, PreviewData, PreviewProps, PreviewType } from "./types";

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

const getFilePreviewUrl = (file, options: MandatoryPreviewOptions): ?PreviewData => {
    let data;

    data = getFileObjectUrlByType(PREVIEW_TYPES.IMAGE, options.imageMimeTypes, options.maxPreviewImageSize, file);

    if (!data) {
        data = getFileObjectUrlByType(PREVIEW_TYPES.VIDEO, options.videoMimeTypes, options.maxPreviewVideoSize, file);
    }

    return data;
};


const loadPreviewUrl = (item: BatchItem, options: MandatoryPreviewOptions): ?PreviewData => {
    let data;

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

    return data;
};
export default (props: PreviewProps): PreviewData[] => {
    const [previews, setPreviews] = useState<PreviewData[]>([]);
    const previewOptions = getMandatoryOptions(props);

    useBatchStartListener((batch: Batch) => {
        const items: BatchItem[] = previewOptions.loadFirstOnly ? batch.items.slice(0, 1) : batch.items;

        const previewsData = items
            .map((item) => loadPreviewUrl(item, previewOptions))
            .filter(Boolean);

        setPreviews(previewsData);
    });

    return previews;
};

