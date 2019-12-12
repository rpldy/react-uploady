// @flow
import React, { useCallback, useState } from "react";
import { isFunction } from "@rupy/shared";
import { useBatchStartListener } from "@rupy/shared-ui";
import { getMandatoryOptions } from "./utils";
import { PREVIEW_TYPES } from "./consts";
import type { Element, ComponentType } from "react";
import type { Batch, BatchItem } from "@rupy/shared";
import type {
	PreviewProps,
		MandatoryPreviewOptions,
		PreviewData,
		PreviewType,
} from "./types";

const getFallbackUrl = (options: MandatoryPreviewOptions, prop: string | Object): ?string | ?PreviewData => {
	return (options.fallbackUrl && isFunction(options.fallbackUrl)) ?
		options.fallbackUrl(prop) : options.fallbackUrl;
};

const getFileObjcetUrlByType = (type: PreviewType, mimeTypes, max, file: Object) => {
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

const getFilePreviewUrl = (file, options: MandatoryPreviewOptions): ?string | ?PreviewData => {
	let data;

	data = getFileObjcetUrlByType(PREVIEW_TYPES.IMAGE, options.imageMimeTypes, options.maxPreviewImageSize, file);

	if (!data) {
		data = getFileObjcetUrlByType(PREVIEW_TYPES.VIDEO, options.videoMimeTypes, options.maxPreviewVideoSize, file);
	}

	return data;
};

const loadPreviewUrl = (item: BatchItem, options: MandatoryPreviewOptions): ?PreviewData => {
	let data;

	if (item.file) {
		data = getFilePreviewUrl(item.file, options);
	} else if (item.url) {
		data = item.url;
	}

	if (!data) {
		const uploadProp = item.file ? item.file : item.url;
		data = getFallbackUrl(options, uploadProp);
	}

	if (data && typeof data === "string") {
		data = {
			url: data,
			type: PREVIEW_TYPES.IMAGE,
		};
	}

	return data;
};

const usePreviewsLoader = (props: PreviewProps): string[] => {
	const [urls, setUrls] = useState<string[]>([]);
	const previewOptions = getMandatoryOptions(props);

	useBatchStartListener((batch: Batch) => {
		const items: BatchItem[] = previewOptions.loadFirstOnly ? batch.items.slice(0, 1) : batch.items;

		const previewUrls = items
			.map((item) => loadPreviewUrl(item, previewOptions))
			.filter(Boolean);

		setUrls(previewUrls);
	});

	return urls;
};

/**
 * doesn't render its own container
 */
const Preview = (props: PreviewProps): Element<"img">[] | Element<ComponentType<any>>[] => {
	const previewUrls = usePreviewsLoader(props);

	const onPreviewLoadError = useCallback((e) => {
		const img = e.target;

		const fallback = getFallbackUrl(props, img.src);

		if (fallback) {
			img.src = fallback;
		}
	});

	return previewUrls.map((url): Element<any> =>
		props.PreviewComponent ? <props.PreviewComponent {...props.previewProps} url={url} /> :
			<img onError={onPreviewLoadError} key={url} src={url}  {...props.previewProps} />);
};

export default Preview;