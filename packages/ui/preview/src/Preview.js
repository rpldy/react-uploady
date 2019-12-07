// @flow
import React, { useCallback, useState } from "react";
import { isFunction } from "@rupy/shared";
import { useBatchStartListener } from "@rupy/shared-ui";
import { getMandatoryOptions } from "./utils";

import type { Element, ComponentType } from "react";
import type { Batch, BatchItem } from "@rupy/shared";
import type {
	PreviewProps,
	MandatoryPreviewOptions,
} from "../types";

const getFallbackUrl = (options: MandatoryPreviewOptions, prop: string | Object): ?string => {
	return (options.fallbackUrl && isFunction(options.fallbackUrl)) ?
		options.fallbackUrl(prop) : options.fallbackUrl;
};

const getFilePreviewUrl = (file, options: MandatoryPreviewOptions): ?string => {
	let url;
	const mimeType = file.type;

	if (options.imageMimeTypes &&
		~options.imageMimeTypes.indexOf(mimeType)) {

		if (!options.maxPreviewImageSize || file.size <= options.maxPreviewImageSize) {
			url = URL.createObjectURL(file);
		}
	} else if (options.videoMimeTypes &&
		~options.videoMimeTypes.indexOf(mimeType)) {

		// if (!options.maxPreviewImageSize || file.size <= options.maxPreviewImageSize) {
		// 	url = URL.createObjectURL(file);
		// }
	}

	return url;
};

const loadPreviewUrl = (item: BatchItem, options: MandatoryPreviewOptions): ?string => {
	let url;

	if (item.file) {
		url = getFilePreviewUrl(item.file, options);
	} else if (item.url) {
		url = item.url;
	}

	if (!url) {
		const uploadProp = item.file ? item.file : item.url;
		url = getFallbackUrl(options, uploadProp);
	}

	return url;
};

const usePreviewLoader = (props: PreviewProps): string[] => {
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
	const previewUrls = usePreviewLoader(props);

	const onPreviewLoadError = useCallback((e) => {
		const img = e.target;

		const fallback = getFallbackUrl(props, img.src);

		if (fallback) {
			img.src = fallback;
		}
	});

	return previewUrls.map((url): Element<any> =>
		props.PreviewComponent ? <props.PreviewComponent {...props.previewProps} url={url}/> :
			<img onError={onPreviewLoadError} key={url} src={url}  {...props.previewProps} />);
};

export default Preview;