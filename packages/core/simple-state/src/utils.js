// @flow
import { PROXY_SYM } from "./consts";
import { isPlainObject, isProduction, hasWindow } from "@rpldy/shared";

const isProxy = (obj: Object) =>
    !isProduction() && !!obj &&
    !!~Object.getOwnPropertySymbols(obj).indexOf(PROXY_SYM);

//check if object is File or react-native file object (it wont by instanceof File in react-native)
const isNativeFile = (obj: any) => (hasWindow() && obj instanceof File) || (obj.name && obj.size && obj.uri);

const isProxiable = (obj: any) =>
    Array.isArray(obj) || (isPlainObject(obj) && !isNativeFile(obj));

export {
    isProxy,
    isProxiable,
};
