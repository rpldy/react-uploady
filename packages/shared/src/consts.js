// @flow

export const DEBUG_LOG_KEY = "__rupy-logger-debug__";

export const BATCH_STATES = Object.freeze({
	ADDED: "added",
	PROCESSING: "processing",
	UPLOADING: "uploading",
	CANCELLED: "cancelled",
	FINISHED: "finished",
});

export const FILE_STATES = Object.freeze({
	ADDED: "added",
	UPLOADING: "uploading",
	CANCELLED: "cancelled",
	FINISHED: "finished",
	ERROR: "error",
	ABORTED: "aborted",
});