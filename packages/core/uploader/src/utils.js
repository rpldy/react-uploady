// @flow
import { hasWindow, isProduction } from "@rpldy/shared";
import { unwrap, isProxiable, isProxy } from "@rpldy/simple-state";
import { DEFAULT_OPTIONS } from "./defaults";

import type { Destination } from "@rpldy/shared";
import type { CreateOptions } from "./types";

const FILE_LIST_SUPPORT = hasWindow() && "FileList" in window;

const getMandatoryDestination = (dest: Destination): Destination => {
    return {
        params: {},
        ...dest,
    };
};

const getMandatoryOptions = (options?: CreateOptions): CreateOptions => {
    return {
        ...DEFAULT_OPTIONS,
        ...options,
        destination: options && options.destination ?
            getMandatoryDestination(options.destination) : null,
    };
};

const getIsFileList = (files: any): boolean =>
    //in case files list was created in a different context(window) need to check toString
    (FILE_LIST_SUPPORT && files instanceof FileList) || files.toString() === "[object FileList]";

/***
 * will unwrap object from proxy
 * if obj itself isnt a proxy, will look for a proxy max 2 levels deep
 */
const deepProxyUnwrap = (obj: any, level: number = 0): any => {
    let result = obj;

    if (!isProduction()) {
        if (level < 3 && isProxy(obj)) {
            result = unwrap(obj);
        } else if (level < 3 && isProxiable(obj)) {
            result = Array.isArray(obj) ?
                obj.map<any[]>((key) => deepProxyUnwrap(obj[key])) :
                Object.keys(obj).reduce<{ [string]: any }>((res, key) => {
                    res[key] = deepProxyUnwrap(obj[key], level + 1);
                    return res;
                }, {});
        }
    }

    return result;
};

export {
    getMandatoryOptions,
    getIsFileList,
    deepProxyUnwrap,
};
