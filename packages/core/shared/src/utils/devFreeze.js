// @flow
import isProduction from "./isProduction";

const devFreeze = (obj: any): any =>
    isProduction() ? obj : Object.freeze(obj);

export default devFreeze;
