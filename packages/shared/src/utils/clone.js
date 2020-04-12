// @flow
import merge from "./merge";

/**
 * does deep clone to the passed object, returning a new object
 * @param obj
 * @returns {Object}
 */
export default (obj: Object) => merge({}, obj);
