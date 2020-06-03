// @flow
import { useState } from "react";
import { isFunction } from "@rpldy/shared";
import { useBatchStartListener } from "@rpldy/shared-ui";
import { PREVIEW_TYPES } from "./consts";
import {
    getWithMandatoryOptions,
    getFallbackUrl,
    getFileObjectUrlByType
} from "./utils";

import type { Batch, BatchItem } from "@rpldy/shared";
import type {
    PreviewComponentPropsOrMethod,
    PreviewData,
    PreviewOptions,
    MandatoryPreviewOptions,
} from "./types";

const getFilePreviewUrl = (file, options: MandatoryPreviewOptions) => {
    let data;

    data = getFileObjectUrlByType(PREVIEW_TYPES.IMAGE, options.imageMimeTypes, options.maxPreviewImageSize || 0, file);

    if (!data) {
        data = getFileObjectUrlByType(PREVIEW_TYPES.VIDEO, options.videoMimeTypes, options.maxPreviewVideoSize || 0, file);
    }

    return data;
};

const loadPreviewData = (
    item: BatchItem,
    options: MandatoryPreviewOptions,
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
		id: item.id,
        props
    };
};

const mergePreviewData = (prev, next) => {
	const newItems = [];

	//dedupe and merge new with existing
	next.forEach((n) => {
		const existingIndex = prev.findIndex((p) => p.id === n.id);

		if (~existingIndex) {
			prev.splice(existingIndex, 1, n);
		} else {
			newItems.push(n);
		}
	});

	return prev.concat(newItems);
};

export default (props: PreviewOptions): PreviewData[] => {
    const [previews, setPreviews] = useState<PreviewData[]>([]);
    const previewOptions: MandatoryPreviewOptions = getWithMandatoryOptions(props);

    useBatchStartListener((batch: Batch) => {
        const items: BatchItem[] = previewOptions.loadFirstOnly ? batch.items.slice(0, 1) : batch.items;

        const previewsData = items
            .map((item) => loadPreviewData(item, previewOptions, props.previewComponentProps))
            .filter(Boolean);

        setPreviews(props.rememberPreviousBatches ?
			mergePreviewData(previews, previewsData) :
			previewsData);
    });

    return previews;
};

