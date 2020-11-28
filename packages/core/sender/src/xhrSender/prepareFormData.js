// @flow
import { isFunction } from "@rpldy/shared";

import type { BatchItem } from "@rpldy/shared";
import type { SendOptions } from "../types";

/**
 * mimics FormData.set() when its not available (react-native)
 * in case FormData.delete() isnt available, will append only (unlike set)
 */
const addToFormData = (fd, name, ...rest) => {
    //rest = [value, fileName = undefined]
    if (fd.set) {
        // $FlowFixMe - ignore flow for not allowing FileLike here
        fd.set(name, ...rest);
    } else {
        if (fd.delete) {
            fd.delete(name);
        }
        // $FlowFixMe - ignore flow for not allowing FileLike here
        fd.append(name, ...rest);
    }
};

const getFormFileField = (fd: FormData, items: BatchItem[], options: SendOptions) => {
    const single = (items.length === 1);

    items.forEach((item: BatchItem, i: number) => {
        const name = single ? options.paramName :
            (isFunction(options.formatGroupParamName) ?
                options.formatGroupParamName(i, options.paramName) :
                `${options.paramName}[${i}]`);

        if (item.file) {
            addToFormData(fd, name, item.file, item.file.name);
        } else if (item.url) {
            addToFormData(fd, name, item.url);
        }
    });
};

const prepareFormData = (items: BatchItem[], options: SendOptions) => {
    const fd = new FormData();

    if (options.params) {
        Object.entries(options.params)
            .forEach(([key, val]: [string, any]) =>
                addToFormData(fd, key, val));
    }

    getFormFileField(fd, items, options);

    return fd;
};

export default prepareFormData;
