// @flow
import { DEFAULT_OPTIONS, DEFAULT_PARAM_NAME } from "./defaults";
import { hasWindow } from "@rpldy/shared";

import type { Destination } from "@rpldy/shared";
import type { CreateOptions } from "./types";

const FILE_LIST_SUPPORT = hasWindow && "FileList" in window;

const getMandatoryDestination = (dest: Destination): Destination => {
    return {
        filesParamName: DEFAULT_PARAM_NAME,
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

const getIsFileList = (files: any) =>
    //in case files list was created in a different context(window) need to check toString
    (FILE_LIST_SUPPORT && files instanceof FileList) || files.toString() === "[object FileList]";

export {
    getMandatoryOptions,
    getIsFileList,
};
