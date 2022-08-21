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
    //cant use * because of flow
    isFunction,
	isPlainObject,
    isSamePropInArrays,
    devFreeze,
    merge,
    getMerge,
    clone,
    pick,
    hasWindow,
    isProduction,
    isPromise,
    scheduleIdleWork,
} from "./utils";

export type * from "./types";
export type {
    MergeOptions
} from "./utils/merge";
