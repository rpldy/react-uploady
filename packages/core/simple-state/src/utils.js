// @flow
import { PROXY_SYM } from "./consts";
import { isPlainObject } from "@rpldy/shared";

const isProd = process.env.NODE_ENV === "production";

const isProxy = (obj: Object) =>
    !isProd && !!obj &&
    !!~Object.getOwnPropertySymbols(obj).indexOf(PROXY_SYM);

//check if object is File or react-native file object (it wont by instanceof File in react-native)
const isNativeFile = (obj: any) => obj instanceof File || (obj.name && obj.size && obj.uri);

const isProxiable = (obj: any) =>
    Array.isArray(obj) || (isPlainObject(obj) && !isNativeFile(obj));

export {
    isProd,
    isProxy,
    isProxiable,
};
