// @flow
import React, { useCallback } from "react";
import usePreviewsLoader from "./usePreviewsLoader";
import { getFallbackUrl } from "./utils";
import { PREVIEW_TYPES } from "./consts";

import type { Element, ComponentType } from "react";
import type {
	PreviewProps,
	PreviewData,
} from "./types";

const showBasicPreview = (type, url, previewProps, onImgError) =>
	type === PREVIEW_TYPES.VIDEO ?
		<video key={url} src={url} controls {...previewProps} /> :
		<img key={url} onError={onImgError} src={url} {...previewProps} />;

const UploadPreview = (props: PreviewProps): Element<"img">[] | Element<ComponentType<any>>[] => {
	const { PreviewComponent, ...previewOptions } = props;
	const previews = usePreviewsLoader(previewOptions);

	const onImagePreviewLoadError = useCallback((e) => {
		const img = e.target;

		const fallback = getFallbackUrl(props.fallbackUrl, img.src);

		if (fallback) {
			img.src = fallback.url;
		}
	}, [props.fallbackUrl]);

	return previews.map((data: PreviewData): Element<any> => {
		const { id, url, type, name, props: previewProps } = data;
		return PreviewComponent ?
			<PreviewComponent key={id + url} id={id} url={url} type={type}
							  name={name} {...previewProps} /> :
			showBasicPreview(type, url, previewProps, onImagePreviewLoadError);
	});
};

export default UploadPreview;
