// @flow
const isPromise = (p: ?mixed): boolean %checks =>
    !!p && typeof p === "object" && typeof p.then === "function";

export default isPromise;

