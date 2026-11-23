// @flow
import merge, { isMergeObj } from "./merge";

type MergeFn = (target: any, ...sources: any[]) => any;

/**
 * does deep clone to the passed object, returning a new object
 * @param obj
 * @param mergeFn the merge function to use (default: utils/merge)
 * @returns {Object}
 */
const clone = (obj: any, mergeFn: MergeFn = merge): any =>
    isMergeObj(obj) ?
        mergeFn((Array.isArray(obj) ? [] : {}), obj) :
        obj;

export default clone;
