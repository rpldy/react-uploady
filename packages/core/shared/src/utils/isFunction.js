// @flow

export default (f: mixed): boolean %checks => typeof (f) === "function";
