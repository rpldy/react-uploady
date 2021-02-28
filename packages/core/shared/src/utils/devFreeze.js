// @flow
import isProduction from "./isProduction";

const devFreeze = (obj: Object): any =>
    isProduction() ? obj : Object.freeze(obj);

export default devFreeze;
