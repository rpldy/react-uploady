// @flow

import { BATCH_STATES, FILE_STATES } from "./consts";
import * as logger from "./logger";
import triggerCancellable from "./triggerCancellable";
import triggerUpdater from "./triggerUpdater";
import createBatchItem from "./batchItem";

export {
    BATCH_STATES,
    FILE_STATES,

    logger,

    triggerCancellable,
    triggerUpdater,
    createBatchItem,
};

export {
    isFunction,
    isSamePropInArrays,
    devFreeze,
} from "./utils";

export type {
    UploadOptions,
    CreateOptions,
    Destination,
    UploadInfo,
    ProgressInfo,
    BatchState,
    FileState,
    NonMaybeTypeFunc,
    Batch,
    BatchItem,
    SendMethod,
    SendResult,
    UploadData,
    OnProgress,
    SendOptions,
    SenderProgressEvent,
    Trigger,
    Cancellable,
    Updater,
    FileLike,
    GetExact,
    FileFilterMethod,
} from "./types";
