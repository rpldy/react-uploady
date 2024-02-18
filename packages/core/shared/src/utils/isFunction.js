// @flow

function isFunction(f: any): f is (...args: any[]) => any {
    return typeof (f) === "function";
}

module.exports = isFunction;
