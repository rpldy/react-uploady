// @flow
const isPromise = (p: ?mixed): boolean %checks =>
    //$FlowExpectedError[method-unbinding]  !!!
    !!p && typeof p === "object" && typeof p.then === "function";

export default isPromise;

