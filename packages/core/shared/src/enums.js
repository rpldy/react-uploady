// @flow

enum BATCH_STATES {
    PENDING ="pending",
    ADDED = "added",
    PROCESSING = "processing",
    UPLOADING = "uploading",
    CANCELLED = "cancelled",
    FINISHED = "finished",
    ABORTED = "aborted",
    ERROR = "error",
}

enum FILE_STATES {
    PENDING = "pending",
    ADDED = "added",
    UPLOADING = "uploading",
    CANCELLED = "cancelled",
    FINISHED = "finished",
    ERROR = "error",
    ABORTED = "aborted",
}

export {
    BATCH_STATES,
    FILE_STATES,
};
