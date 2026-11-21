// @flow
import isProduction from "./isProduction";

const devFreeze = <T>(obj: T): T =>
    isProduction() ? obj : Object.freeze(obj);

export default devFreeze;
