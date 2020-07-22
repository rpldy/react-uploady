// @flow
import merge, { isMergeObj } from "./merge";

/**
 * does deep clone to the passed object, returning a new object
 * @param obj
 * @param mergeFn the merge function to use (default: utils/merge)
 * @returns {Object}
 */
export default (obj: Object, mergeFn = merge) =>
	isMergeObj(obj) ?
		mergeFn(Array.isArray(obj) ? [] : {}, obj) :
		obj;
