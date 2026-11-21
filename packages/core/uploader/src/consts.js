// @flow
import { devFreeze, FILE_STATES } from "@rpldy/shared";
import type { FILE_STATES as FileStatesType } from "@rpldy/shared";

type UploaderEventsMap = Readonly<{
    BATCH_ADD: string,
    BATCH_START: string,
    BATCH_PROGRESS: string,
    BATCH_FINISH: string,
    BATCH_ABORT: string,
    BATCH_CANCEL: string,
    BATCH_ERROR: string,
    BATCH_FINALIZE: string,
    ITEM_START: string,
    ITEM_CANCEL: string,
    ITEM_PROGRESS: string,
    ITEM_FINISH: string,
    ITEM_ABORT: string,
    ITEM_ERROR: string,
    ITEM_FINALIZE: string,
    REQUEST_PRE_SEND: string,
    ALL_ABORT: string,
}>;

export const UPLOADER_EVENTS: UploaderEventsMap = devFreeze({
    BATCH_ADD: "BATCH-ADD",
    BATCH_START: "BATCH-START",
    BATCH_PROGRESS: "BATCH_PROGRESS",
    BATCH_FINISH: "BATCH-FINISH",
    BATCH_ABORT: "BATCH-ABORT",
    BATCH_CANCEL: "BATCH-CANCEL",
    BATCH_ERROR: "BATCH-ERROR",
    BATCH_FINALIZE: "BATCH-FINALIZE",

    ITEM_START: "FILE-START",
    ITEM_CANCEL: "FILE-CANCEL",
    ITEM_PROGRESS: "FILE-PROGRESS",
    ITEM_FINISH: "FILE-FINISH",
    ITEM_ABORT: "FILE-ABORT",
    ITEM_ERROR: "FILE-ERROR",
    ITEM_FINALIZE: "FILE-FINALIZE",

    REQUEST_PRE_SEND: "REQUEST_PRE_SEND",

    ALL_ABORT: "ALL_ABORT",
});

export const PROGRESS_DELAY = 50;

export const SENDER_EVENTS: Readonly<{ ITEM_PROGRESS: string, BATCH_PROGRESS: string }> = devFreeze({
    ITEM_PROGRESS: "ITEM_PROGRESS",
    BATCH_PROGRESS: "BATCH_PROGRESS",
});

export const ITEM_FINALIZE_STATES: Array<FileStatesType> = [
    FILE_STATES.FINISHED,
    FILE_STATES.ERROR,
    FILE_STATES.CANCELLED,
    FILE_STATES.ABORTED
];
