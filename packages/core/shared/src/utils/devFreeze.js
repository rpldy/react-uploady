// @flow
import isProduction from "./isProduction";

const devFreeze = (obj: Object) =>
    isProduction() ? obj : Object.freeze(obj);

export default devFreeze;
