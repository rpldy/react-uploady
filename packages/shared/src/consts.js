// @flow

export const DEBUG_LOG_KEY = "__rupy-logger-debug__";

export const BATCH_STATES = Object.freeze({
	ADDED: 1,
	PROCESSING: 2,
	UPLOADING: 3,
	CANCELLED: 4,
	FINISHED: 5,
});

export const FILE_STATES = Object.freeze({
	ADDED: 1,
	UPLOADING: 2,
	CANCELLED: 3,
	FINISHED: 4,
	ERROR: 5,
	ABORTED: 6,
});