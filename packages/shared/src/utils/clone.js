// @flow
import merge, { isMergeObj } from "./merge";

/**
 * does deep clone to the passed object, returning a new object
 * @param obj
 * @returns {Object}
 */
export default (obj: Object) =>
	isMergeObj(obj) ?
		merge(Array.isArray(obj) ? [] : {}, obj) :
		obj;
