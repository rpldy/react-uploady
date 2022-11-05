// @flow
import isFunction from "./isFunction";
import isSamePropInArrays from "./isSamePropInArrays";
import devFreeze from "./devFreeze";
import merge, { getMerge } from "./merge";
import clone from "./clone";
import pick from "./pick";
import isPlainObject from "./isPlainObject";
import hasWindow from "./hasWindow";
import isProduction from "./isProduction";
import isPromise from "./isPromise";
import scheduleIdleWork from "./scheduleIdleWork";
import isEmpty from "./isEmpty";

export {
    isFunction,
    isSamePropInArrays,
    devFreeze,
    merge,
    getMerge,
    clone,
    pick,
	isPlainObject,
    hasWindow,
    isProduction,
    isPromise,
    scheduleIdleWork,
    isEmpty,
};
