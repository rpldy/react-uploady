// @flow
import XhrPromise from "./XhrPromise";
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

const request = (url: string, data?: mixed, options: RequestOptions = {}): XhrPromise => {
    const req = new XMLHttpRequest();

    return new XhrPromise(
        (resolve, reject) => {
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
    }, req);
};

export default request;
