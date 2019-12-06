// @flow
import React, { useState } from "react";
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
	}
	else if (item.url) {
		url = item.url;
	}

	return url;
};

const usePreviewLoader = (options: MandatoryPreviewOptions): string[] => {
	const [urls, setUrls] = useState([]);
	const previewOptions = getMandatoryOptions(options);

	useBatchStartListener((batch: Batch) => {
		const items = options.loadFirstOnly ? batch.items.slice(0, 1) : batch.items;

		const urls = items.map((item) => loadPreviewUrl(item, options));
	});

	return urls;
};

/**
 * doesn't render its own container
 */
const Preview = (props: PreviewProps): Element<"img">[] | Element<ComponentType<any>>[] => {
	const previews = usePreviewLoader(props);

	return previews.map((url): Element<any> =>
		props.PreviewComponent ? <props.PreviewComponent {...props.previewProps} url={url} /> :
			<img key={url} src={url}  {...props.previewProps} />);
};

export default Preview;