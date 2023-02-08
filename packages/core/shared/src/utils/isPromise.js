// @flow
declare function isPromise(obj: mixed): boolean %checks(
    obj instanceof Promise
)

//eslint-disable-next-line no-redeclare
function isPromise(obj: mixed) {
    return obj && typeof obj === "object" && typeof obj.then === "function";
}

export default isPromise;

