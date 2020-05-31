// @flow
import { isFunction } from "@rpldy/shared";

import type { BatchItem } from "@rpldy/shared";
import type { SendOptions } from "../types";

const getFormFileField = (fd: FormData, items: BatchItem[], options: SendOptions) => {
    const single = (items.length === 1);

    items.forEach((item: BatchItem, i: number) => {
        const name = single ? options.paramName :
            (isFunction(options.formatGroupParamName) ?
                options.formatGroupParamName(i, options.paramName) :
                `${options.paramName}[${i}]`);

        if (item.file) {
            // $FlowFixMe - ignore flow for not allowing FileLike here
            fd.set(name, item.file, item.file.name);
        } else if (item.url) {
            fd.set(name, item.url);
        }
    });
};

export default (items: BatchItem[], options: SendOptions) => {
    const fd = new FormData();

    getFormFileField(fd, items, options);

    if (options.params) {
        Object.entries(options.params)
            .forEach(([key, val]: [string, any]) => fd.set(key, val));
    }

    return fd;
};
