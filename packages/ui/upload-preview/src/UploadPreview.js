// @flow
import React, { useCallback, useEffect, useImperativeHandle } from "react";
import usePreviewsLoader from "./usePreviewsLoader";
import { getFallbackUrl } from "./utils";
import { PREVIEW_TYPES } from "./consts";

import type { Element, ComponentType } from "react";
import type {
	PreviewProps,
	PreviewData,
	PreviewItem,
	PreviewMethods,
} from "./types";

const showBasicPreview = (type, url, previewProps, onImgError) =>
	type === PREVIEW_TYPES.VIDEO ?
		<video key={url} src={url} controls {...previewProps} /> :
		<img key={url} onError={onImgError} src={url} {...previewProps} />;

const usePreviewMethods = (previews, clearPreviews, previewMethodsRef, onPreviewsChanged) => {
    useImperativeHandle<?PreviewMethods>(previewMethodsRef, () => ({ clear: clearPreviews }), [clearPreviews]);

	useEffect(() => {
		if (onPreviewsChanged) {
			onPreviewsChanged(previews);
		}
	},[previews, onPreviewsChanged]);
};

const UploadPreview = (props: PreviewProps): Element<"img">[] | Element<ComponentType<any>>[] => {
	const { PreviewComponent, previewMethodsRef, onPreviewsChanged, ...previewOptions } = props;
	const { previews, clearPreviews }: PreviewData = usePreviewsLoader(previewOptions);

	const onImagePreviewLoadError = useCallback((e) => {
		const img = e.target;

		const fallback = getFallbackUrl(props.fallbackUrl, img.src);

		if (fallback) {
			img.src = fallback.url;
		}
	}, [props.fallbackUrl]);

	usePreviewMethods(
		previews,
		clearPreviews,
		previewMethodsRef,
		onPreviewsChanged);

	return previews.map((data: PreviewItem): Element<any> => {
		const { id, url, type, name, isFallback, props: previewProps } = data;
		return PreviewComponent ?
			<PreviewComponent key={id + url} id={id} url={url} type={type}
							  name={name} isFallback={isFallback} {...previewProps} /> :
			showBasicPreview(type, url, previewProps, onImagePreviewLoadError);
	});
};

export default UploadPreview;
