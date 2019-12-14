// @flow
import * as React from "react";
import type { NonMaybeTypeFunc } from "@rpldy/shared";
import { PREVIEW_TYPES } from "./consts";

export type PreviewType = $Values<typeof PREVIEW_TYPES>;

export type PreviewData = {
	url: string,
	type: PreviewType,
};

export type FallbackType = string | PreviewData;

export type FallbackMethod = (file: Object) => ?FallbackType;

export type PreviewOptions = {|
	//whether to load only the first preview in case of a batch upload (default: false)
	loadFirstOnly?: boolean,
	//the maximum file size (in kb) to attempt to load a preview for an image (default: 20,000,000)
	maxPreviewImageSize?: number,
	//the maximum file size (in kb) to attempt to load a preview for a video (default: 100,000,000)
	maxPreviewVideoSize?: number,
	//URL to use or function to call with the file to determine fallback for invalid file URLs, none-images or too large files to preview (maxPreviewImageSize)
	fallbackUrl?: string | FallbackMethod,
	//the image mime-types to load previews for (default: )
	imageMimeTypes?: string[],
	//the video mime-types to load preview for (default: )
	videoMimeTypes?: string[],
|};

export type PreviewProps = PreviewOptions & {
	PreviewComponent?: React.ComponentType<any>,
	previewProps?: Object,
};

export type MandatoryPreviewOptions = $Exact<$ObjMap<PreviewProps, NonMaybeTypeFunc>>;
