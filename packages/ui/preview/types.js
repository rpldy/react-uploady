// @flow
import * as React from "react";
import type { NonMaybeTypeFunc } from "@rupy/shared";

export type PreviewOptions = {|
	//whether to load only the first preview in case of a batch upload (default: false)
	loadFirstOnly?: boolean,
	//the maximum file size (in kb) to attempt to load a preview for an image (default: 20,000,000)
	maxPreviewImageSize?: number,
	//the maximum file size (in kb) to attempt to load a preview for a video (default: 100,000,000)
	maxPreviewVideoSize?: number,
	//URL to use or function to call with the file to determine fallback for invalid file URLs, none-images or too large files to preview (maxPreviewImageSize)
	fallbackUrl?: string | (file: File) => string,
|};

export type MandatoryPreviewOptions = $Exact<$ObjMap<PreviewProps, NonMaybeTypeFunc>>;

export type PreviewProps = PreviewOptions & {
	PreviewComponent?: React.ComponentType<any>,
	previewProps?: Object,
};
