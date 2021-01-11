// @flow

export const DEBUG_LOG_KEY = "__rupy-logger-debug__";

export const BATCH_STATES = {
    PENDING: "pending",
	ADDED: "added",
	PROCESSING: "processing",
	UPLOADING: "uploading",
	CANCELLED: "cancelled",
	FINISHED: "finished",
	ABORTED: "aborted",
};

export const FILE_STATES = {
    PENDING: "pending",
	ADDED: "added",
	UPLOADING: "uploading",
	CANCELLED: "cancelled",
	FINISHED: "finished",
	ERROR: "error",
	ABORTED: "aborted",
};
