// @flow

export const DEFAULT_PARAM_NAME = "file";

export const DEFAULT_FILTER = () => true;

export const DEFAULT_OPTIONS = Object.freeze({
	autoUpload: true,
	multiple: true,
	inputFieldName: "file",
	concurrent: false,
	maxConcurrent: 2,
	grouped: false,
	maxGroupSize: 5,
	// encoding: "multipart/form-data",
	method: "POST",
	params: {},
	inputAccept: "",
	fileFilter: DEFAULT_FILTER,
	forceJsonResponse: false,
	withCredentials: false,
	destination: {},
	send: null,
});