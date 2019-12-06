// @flow
import React, { useState } from "react";
import { isFunction } from "@rupy/shared";
import { useBatchStartListener } from "@rupy/shared-ui";
import { getMandatoryOptions } from "./utils";

import type { Element, ComponentType } from "react";
import type { Batch, BatchItem } from "@rupy/shared";
import type {
	PreviewProps,
	MandatoryPreviewOptions,
} from "../types";

const loadPreviewUrl = (item: BatchItem, options: MandatoryPreviewOptions): ?string => {
	let url;

	if (item.file) {

		//TODO - only certain mime types!	

		if (!options.maxPreviewImageSize || item.file.size <= options.maxPreviewImageSize) {
			url = URL.createObjectURL(item.file);
		}
	} else if (item.url) {
		url = item.url;
	} else {
		url = options.fallbackUrl && isFunction(options.fallbackUrl) ?
			options.fallbackUrl(item.file) : options.fallbackUrl;
	}

	return url;
};

const usePreviewLoader = (options: MandatoryPreviewOptions): string[] => {
	const [urls, setUrls] = useState<string[]>([]);
	const previewOptions = getMandatoryOptions(options);

	useBatchStartListener((batch: Batch) => {
		const items = options.loadFirstOnly ? batch.items.slice(0, 1) : batch.items;

		const urls: string[] = items
			.map((item) => loadPreviewUrl(item, previewOptions))
			.filter((u): boolean => !!u);

		setUrls(urls);
	});

	return urls;
};

/**
 * doesn't render its own container
 */
const Preview = (props: PreviewProps): Element<"img">[] | Element<ComponentType<any>>[] => {
	const previewUrls = usePreviewLoader(props);

	return previewUrls.map((url): Element<any> =>
		props.PreviewComponent ? <props.PreviewComponent {...props.previewProps} url={url}/> :
			<img key={url} src={url}  {...props.previewProps} />);
};

export default Preview;