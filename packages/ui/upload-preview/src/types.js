// @flow
import * as React from "react";
import type { BatchItem, NonMaybeTypeFunc } from "@rpldy/shared";
import { PREVIEW_TYPES } from "./consts";

export type PreviewType = $Values<typeof PREVIEW_TYPES>;

export type PreviewData = {
	url: string,
	type: PreviewType,
    props: Object,
};

export type FallbackType = string | PreviewData;

export type FallbackMethod = (file: Object) => ?FallbackType;

export type PreviewComponentPropsOrMethod = Object | (item: BatchItem, url: string, type: PreviewType) => Object

export type PreviewOptions = {|
	//whether to load only the first upload-preview in case of a batch upload (default: false)
	loadFirstOnly?: boolean,
	//the maximum file size (in kb) to attempt to load a upload-preview for an image (default: 20,000,000)
	maxPreviewImageSize?: number,
	//the maximum file size (in kb) to attempt to load a upload-preview for a video (default: 100,000,000)
	maxPreviewVideoSize?: number,
	//URL to use or function to call with the file to determine fallback for invalid file URLs, none-images or too large files to upload-preview (maxPreviewImageSize)
	fallbackUrl?: string | FallbackMethod,
	//the image mime-types to load previews for (default: ["image/jpeg", "image/webp", "image/gif", "image/png", "image/apng", "image/bmp", "image/x-icon", "image/svg+xml"])
	imageMimeTypes?: string[],
	//the video mime-types to load upload-preview for (default: ["video/mp4", "video/webm", "video/ogg"])
	videoMimeTypes?: string[],
    //either object or function to generate object as additional props for the preview component
    previewComponentProps?: PreviewComponentPropsOrMethod,
|};

export type PreviewProps =  {|
    ...PreviewOptions,
	PreviewComponent?: React.ComponentType<any>,
|};

// export type MandatoryPreviewOptions = $Exact<$ObjMap<PreviewProps, NonMaybeTypeFunc>>;
export type MandatoryPreviewOptions = {|
    loadFirstOnly: boolean,
    maxPreviewImageSize: number,
    maxPreviewVideoSize: number,
    fallbackUrl: string | FallbackMethod,
    imageMimeTypes: string[],
    videoMimeTypes: string[],
    previewComponentProps?: PreviewComponentPropsOrMethod,
|};
