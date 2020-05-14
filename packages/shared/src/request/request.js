// @flow
import type { RequestOptions } from "../types";

const setHeaders = (req, headers: Object): ?Headers => {
    if (headers) {
        Object.keys(headers).forEach((name) => {
            if (headers[name] !== undefined) {
                req.setRequestHeader(name, headers[name]);
            }
        });
    }
};

export default (url: string, data?: mixed, options: RequestOptions = {}): Promise<XMLHttpRequest> => {
    const req = new XMLHttpRequest();

    const pXhr = new Promise((resolve, reject) => {
        req.onerror = () => reject(req);
        req.ontimeout = () => reject(req);
        req.onabort = () => reject(req);
        req.onload = () => resolve(req);

        req.open((options.method || "GET"), url);
        setHeaders(req, options.headers);
        req.withCredentials = !!options.withCredentials;

        if (options.preSend) {
            options.preSend(req);
        }

        req.send(data);
    });

    // $FlowFixMe - adding xhr to Promise
    pXhr.xhr = req;
    return pXhr;
};
