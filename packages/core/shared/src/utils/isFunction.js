// @flow

//defined as function for flow's sake... (https://github.com/facebook/flow/issues/3635)
function isFunction(f: mixed): boolean %checks {
    return typeof (f) === "function";
}

module.exports = isFunction;
