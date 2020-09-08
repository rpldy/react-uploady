// @flow
import invariant from "invariant";
import throttle from "just-throttle";
import { BATCH_STATES, FILE_STATES } from "./consts";
import * as logger from "./logger";
import triggerCancellable from "./triggerCancellable";
import triggerUpdater from "./triggerUpdater";
import createBatchItem from "./batchItem";
import request, { parseResponseHeaders } from "./request";

export {
    BATCH_STATES,
    FILE_STATES,

    //one source for invariant to all other packages
    invariant,

    //one source for throttle to all other packages
    throttle,

    logger,

    triggerCancellable,
    triggerUpdater,
    createBatchItem,
    request,
    parseResponseHeaders,
};

export {
    isFunction,
	isPlainObject,
    isSamePropInArrays,
    devFreeze,

    merge,
    getMerge,

    clone,
    pick,
} from "./utils";

export type {
    UploadOptions,
    Destination,
    UploadInfo,
    ProgressInfo,
    BatchState,
    FileState,
    NonMaybeTypeFunc,
    Batch,
    BatchItem,
    UploadData,
    FormatParamGroupNameMethod,
    Trigger,
    Cancellable,
    Updater,
    FileLike,
    GetExact,
    FileFilterMethod,
} from "./types";

export type {
    MergeOptions
} from "./utils/merge";
