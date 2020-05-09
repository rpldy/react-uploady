// @flow
import type { RequestOptions } from "./types";

const setHeaders = (req, headers: Object) => {
    if (headers) {
        Object.keys(headers).forEach((name) =>
            req.setRequestHeader(name, headers[name]));
    }
};

export default (url, data, options: RequestOptions) => { //method = "GET", data?: any, headers: Object = {}, withCredentials?: boolean) => {
    const req = new XMLHttpRequest();

    const pXhr = new Promise((resolve, reject) => {
        // const formData = prepareFormData(items, options);

        req.onerror = () => reject(req);
        req.ontimeout = () => reject(req);
        req.onabort = () => reject(req);
        req.onload = () => resolve(req);

        // req.upload.onprogress = (e) => {
        //     if (e.lengthComputable && onProgress) {
        //         onProgress(e, items.slice());
        //     }
        // };

        req.open((options.method || "GET"), url);
        setHeaders(req, options.headers);
        req.withCredentials = !!options.withCredentials;

        if (options.preSend) {
            options.preSend(req);
        }

        req.send(data);
    });

    pXhr.xhr = req;
    return pXhr;
};
