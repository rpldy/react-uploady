// @flow
import React, { useCallback, useEffect, useImperativeHandle } from "react";
import { useBatchStartListener } from "@rpldy/shared-ui";
import { getPreviewsLoaderHook } from "./usePreviewsLoader";
import { getFallbackUrlData } from "./utils";
import { PREVIEW_TYPES } from "./consts";

import type { Element, ComponentType } from "react";
import type { RefObject } from "@rpldy/shared-ui";
import type {
	PreviewProps,
	PreviewData,
	PreviewItem,
	PreviewMethods,
    PreviewBatchItemsMethod,
    ClearPreviewsMethod,
    RemovePreviewMethod,
    PreviewsChangedHandler,
} from "./types";


const showBasicPreview = (type: string, url: string, previewProps: Object, onImgError: (e: SyntheticEvent<HTMLImageElement>) => void) =>
	type === PREVIEW_TYPES.VIDEO ?
		<video key={url} src={url} controls {...previewProps} /> :
		<img key={url} onError={onImgError} src={url} {...previewProps} />;

const usePreviewMethods = (
    previews: PreviewItem[],
    clearPreviews: ClearPreviewsMethod,
    previewMethodsRef: ?RefObject<PreviewMethods>,
    onPreviewsChanged: ?PreviewsChangedHandler,
    removeItemFromPreview: RemovePreviewMethod
) => {
    useImperativeHandle<?PreviewMethods>(previewMethodsRef,
        () => ({ clear: clearPreviews, removePreview: removeItemFromPreview }),
        [clearPreviews, removeItemFromPreview]
    );

	useEffect(() => {
		if (onPreviewsChanged) {
			onPreviewsChanged(previews);
		}
	},[previews, onPreviewsChanged]);
};

const getUploadPreviewForBatchItemsMethod =
    (method: PreviewBatchItemsMethod = useBatchStartListener): React$StatelessFunctionalComponent<PreviewProps> => {
    const usePreviewsLoader = getPreviewsLoaderHook(method);

    return (props: PreviewProps): Element<"img">[] | Element<ComponentType<any>>[] => {
        const { PreviewComponent, previewMethodsRef, onPreviewsChanged, ...previewOptions } = props;
        const { previews, clearPreviews, removeItemFromPreview }: PreviewData = usePreviewsLoader(previewOptions);

        const onImagePreviewLoadError = useCallback((e: SyntheticEvent<HTMLImageElement>) => {
            const img = (e.currentTarget: HTMLImageElement);

            const fallback = getFallbackUrlData(props.fallbackUrl, img.src);

            if (fallback) {
                img.src = fallback.url;
            }
        }, [props.fallbackUrl]);

        usePreviewMethods(
            previews,
            clearPreviews,
            previewMethodsRef,
            onPreviewsChanged,
            removeItemFromPreview
        );

        return previews.map((data: PreviewItem): Element<any> => {
            const { id, url, type, name, isFallback, removePreview, props: previewProps } = data;

            return PreviewComponent ?
                <PreviewComponent
                    key={id + url}
                    id={id}
                    url={url}
                    type={type}
                    name={name}
                    isFallback={isFallback}
                    removePreview={removePreview}
                    {...previewProps}
                /> :
                showBasicPreview(type, url, previewProps, onImagePreviewLoadError);
        });
    };
};

/**
 * UploadPreview uses Batch start event to display uploading items
 */
const UploadPreview: React$StatelessFunctionalComponent<PreviewProps> = getUploadPreviewForBatchItemsMethod();

export {
    getUploadPreviewForBatchItemsMethod
};

export default UploadPreview;
