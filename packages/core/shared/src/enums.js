// @flow

export const BATCH_STATES = Object.freeze({
    PENDING: "pending",
    ADDED: "added",
    PROCESSING: "processing",
    UPLOADING: "uploading",
    CANCELLED: "cancelled",
    FINISHED: "finished",
    ABORTED: "aborted",
    ERROR: "error",
});

export type BatchStatesEnum = Values<typeof BATCH_STATES>;

export const FILE_STATES = Object.freeze({
    PENDING: "pending",
    ADDED: "added",
    UPLOADING: "uploading",
    CANCELLED: "cancelled",
    FINISHED: "finished",
    ERROR: "error",
    ABORTED: "aborted",
});

export type FileStatesEnum = Values<typeof FILE_STATES>;
