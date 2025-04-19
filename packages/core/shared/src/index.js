// @flow
import invariant from "invariant";
import throttle from "just-throttle";
import * as logger from "./logger";
import triggerCancellable from "./triggerCancellable";
import triggerUpdater from "./triggerUpdater";
import createBatchItem, { getIsBatchItem } from "./batchItem";
import request, { parseResponseHeaders, XhrPromise } from "./request";

export {
    //one source for invariant to all other packages
    invariant,

    //one source for throttle to all other packages
    throttle,

    logger,

    triggerCancellable,
    triggerUpdater,
    createBatchItem,
    getIsBatchItem,
    request,
    parseResponseHeaders,
    XhrPromise,
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
    isEmpty,
} from "./utils";

export type * from "./types";

export { FILE_STATES, BATCH_STATES } from "./enums";

export type {
    MergeOptions
} from "./utils/merge";
