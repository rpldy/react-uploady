// @flow

export const DEFAULT_PARAM_NAME = "file";

export const DEFAULT_OPTIONS = {
	autoUpload: true,
	multiple: true,
	concurrent: false,
	maxConcurrent: 2,
	grouped: false,
	maxGroupSize: 5,
	preview: false,
	maxPreviewImageSize: 2e+7,
	maxPreviewVideoSize: 1e+8,
	encoding: "multipart/form-data",
	method: "POST",
};