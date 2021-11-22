// @flow
import { debugLog } from "../logger";
import type { Headers } from "../types";

const parseResponseHeaders = (xhr: XMLHttpRequest): ?Headers => {
    let resHeaders;

    try {
        resHeaders = xhr.getAllResponseHeaders().trim()
            .split(/[\r\n]+/)
            .reduce((res, line: string) => {
                const [key, val] = line.split(": ");
                res[key] = val;
                return res;
            }, {});
    } catch (ex) {
        debugLog("uploady.request: failed to read response headers", xhr);
    }

    return resHeaders;
};

export default parseResponseHeaders;
