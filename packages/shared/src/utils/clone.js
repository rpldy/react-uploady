// @flow
import merge, { isMergeObj } from "./merge";

type MergeFn = (target: Object, ...sources: Object[]) => any;

/**
 * does deep clone to the passed object, returning a new object
 * @param obj
 * @param mergeFn the merge function to use (default: utils/merge)
 * @returns {Object}
 */
export default (obj: Object, mergeFn: MergeFn = merge) =>
	isMergeObj(obj) ?
		mergeFn(Array.isArray(obj) ? [] : {}, obj) :
		obj;
