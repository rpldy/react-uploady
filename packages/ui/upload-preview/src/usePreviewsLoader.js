// @flow
import { useState, useCallback, useMemo } from "react";
import { isFunction } from "@rpldy/shared";
import { PREVIEW_TYPES } from "./consts";
import {
    getWithMandatoryOptions,
    getFallbackUrlData,
    getFileObjectUrlByType
} from "./utils";

import type { Batch, BatchItem, FileLike } from "@rpldy/shared";
import type {
    PreviewComponentPropsOrMethod,
    PreviewItem,
    PreviewOptions,
    MandatoryPreviewOptions,
    PreviewData,
    PreviewBatchItemsMethod,
    PreviewsLoaderHook,
    PreviewType,
    RemovePreviewMethod, BasicPreviewItem,
} from "./types";

const getFilePreviewUrl = (file: FileLike, options: MandatoryPreviewOptions) => {
    let data;

    data = getFileObjectUrlByType(PREVIEW_TYPES.IMAGE, options.imageMimeTypes, options.maxPreviewImageSize || 0, file);

    if (!data) {
        data = getFileObjectUrlByType(PREVIEW_TYPES.VIDEO, options.videoMimeTypes, options.maxPreviewVideoSize || 0, file);
    }

    return data;
};

const getItemProps = (previewComponentProps: PreviewComponentPropsOrMethod, item: ?BatchItem, url: string, type: PreviewType) => {
    return isFunction(previewComponentProps) ?
        previewComponentProps(item, url, type) :
        previewComponentProps;
};

const loadPreviewData = (
    item: BatchItem,
    options: MandatoryPreviewOptions,
    removeItemFromPreview: RemovePreviewMethod,
): ?PreviewItem => {
    let data: ?BasicPreviewItem, isFallback = false;

    const removePreview =  () => removeItemFromPreview(item.id);

    if (item.file) {
        const file = item.file;
        data = getFilePreviewUrl(item.file, options);

        if (!data) {
            data = getFallbackUrlData(options.fallbackUrl, file);
            isFallback = true;
        }
    } else {
        data = {
            url: item.url,
            name: item.url,
            type: PREVIEW_TYPES.IMAGE,
        };
    }

    return data && {
        ...data,
        id: item.id,
        isFallback,
        removePreview,
    };
};

const mergePreviewData = (prev: PreviewItem[], next: PreviewItem[]) => {
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

const getPreviewsDataWithItemProps = (
    previewsData: PreviewItem[],
    items: BatchItem[],
    previewComponentProps: PreviewComponentPropsOrMethod,
) => {
    let newData = previewsData;

    if (previewComponentProps) {
        newData = previewsData.map((pd) => ({
            ...pd,
            props: getItemProps(
                previewComponentProps,
                items.find(({ id }) => id === pd.id),
                pd.url,
                pd.type,
            ),
        }));
    }

    return newData;
};

const getPreviewsLoaderHook = (batchItemsMethod: PreviewBatchItemsMethod): PreviewsLoaderHook => {
    return (props?: PreviewOptions): PreviewData => {
        const { previewComponentProps, rememberPreviousBatches } = props || {};
        const [previews, setPreviews] = useState<{ previews: PreviewItem[], items: BatchItem[] }>({ previews: [], items: [] });
        const previewOptions: MandatoryPreviewOptions = getWithMandatoryOptions(props);

        const clearPreviews = useCallback(() => {
            setPreviews({ previews: [], items: [] });
        }, []);

        const removeItemFromPreview = useCallback((id: string) => {
            setPreviews(({ previews, items }) => ({
                previews: previews.filter((prev) => prev.id !== id),
                items: items.filter((item) => item.id !== id),
            }));
        }, []);

        batchItemsMethod((batch: Batch) => {
            const items: BatchItem[] = previewOptions.loadFirstOnly ? batch.items.slice(0, 1) : batch.items;

            const previewsData = items
                .map((item) => loadPreviewData(item, previewOptions, removeItemFromPreview))
                .filter(Boolean);

            setPreviews({
                previews: rememberPreviousBatches ?
                    mergePreviewData(previews.previews, previewsData) : previewsData,
                items: rememberPreviousBatches ? previews.items.concat(items) : items,
            });
        });

        const previewsWithItemProps = useMemo(() =>
                getPreviewsDataWithItemProps(previews.previews, previews.items, previewComponentProps),
            [previews, previewComponentProps]);

        return { previews: previewsWithItemProps, clearPreviews, removeItemFromPreview };
    };
};

export {
    getPreviewsLoaderHook
};
