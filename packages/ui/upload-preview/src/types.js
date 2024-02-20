// @flow
import * as React from "react";
import { PREVIEW_TYPES } from "./consts";

import type { BatchItem, Batch } from "@rpldy/shared";
import type { RefObject } from "@rpldy/shared-ui";

export type PreviewType = $Values<typeof PREVIEW_TYPES>;

export type RemovePreviewMethod = (id: string) => void;
export type ClearPreviewsMethod = () => void;

export type BasicPreviewItem = {|
    url: string,
    name: string,
    type: PreviewType,
|};

export type PreviewItem = {|
    ...BasicPreviewItem,
    id: string,
    removePreview: () => void,
    isFallback?: boolean,
    props?: Object,
|};

export type PreviewData = {
	previews: PreviewItem[],
	clearPreviews: ClearPreviewsMethod,
    removeItemFromPreview: RemovePreviewMethod,
};

export type FallbackType = string | BasicPreviewItem;

export type FallbackMethod = (file: Object) => ?FallbackType;

export type PreviewComponentPropsOrMethod = Object | (item: ?BatchItem, url: string, type: PreviewType) => Object

export type PreviewMethods = {
	clear: () => void,
    removePreview: RemovePreviewMethod,
};

export type PreviewBatchItemsMethod = (cb: (batch: Batch, ...params: any[]) => void) => void;

export type PreviewOptions = {|
	//whether to show previous batches' previews as opposed to just the last (default: false)
	rememberPreviousBatches?: boolean,
	//whether to load only the first upload-preview in case of a batch upload (default: false)
	loadFirstOnly?: boolean,
	//the maximum file size (in kb) to attempt to load a upload-preview for an image (default: 20,000,000)
	maxPreviewImageSize?: number,
	//the maximum file size (in kb) to attempt to load a upload-preview for a video (default: 100,000,000)
	maxPreviewVideoSize?: number,
	//URL to use or function to call with the file to determine fallback for
	// invalid file URLs, none-images or too large files to upload-preview (maxPreviewImageSize)
	fallbackUrl?: string | FallbackMethod,
	//the image mime-types to load previews for
	// (default: ["image/jpeg", "image/webp", "image/gif", "image/png", "image/apng", "image/bmp", "image/x-icon", "image/svg+xml"])
	imageMimeTypes?: string[],
	//the video mime-types to load upload-preview for (default: ["video/mp4", "video/webm", "video/ogg"])
	videoMimeTypes?: string[],
    //either object or function to generate object as additional props for the preview component
    previewComponentProps?: PreviewComponentPropsOrMethod,
|};

export type PreviewsChangedHandler = (PreviewItem[]) => void;

export type PreviewProps =  {|
    ...PreviewOptions,
	//custom component to render the preview (default: img tag)
	PreviewComponent?: React.ComponentType<any>,
	//ref will be set with API methods (PreviewMethods)
	previewMethodsRef?: RefObject<PreviewMethods>,
	//callback that will be called when preview items are loaded or changed
	onPreviewsChanged?: PreviewsChangedHandler,
|};

export type MandatoryPreviewOptions = {|
    rememberPreviousBatches: boolean,
    loadFirstOnly: boolean,
    maxPreviewImageSize: number,
    maxPreviewVideoSize: number,
    fallbackUrl: string | FallbackMethod,
    imageMimeTypes: string[],
    videoMimeTypes: string[],
    previewComponentProps: PreviewComponentPropsOrMethod,
|};

export type PreviewsLoaderHook = (props?: PreviewOptions) => PreviewData;
