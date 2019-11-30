// @flow

export const DEFAULT_PARAM_NAME = "file";

export const DEFAULT_OPTIONS = Object.freeze({
	autoUpload: true,
	multiple: true,
	inputFieldName: "file",
	concurrent: false,
	maxConcurrent: 2,
	grouped: false,
	maxGroupSize: 5,
	preview: false,
	maxPreviewImageSize: 2e+7,
	maxPreviewVideoSize: 1e+8,
	// encoding: "multipart/form-data",
	method: "POST",
	params: {},
	inputAccept: "",
	fileFilter: () => true,
	forceJsonResponse: false,
	withCredentials: false,
});