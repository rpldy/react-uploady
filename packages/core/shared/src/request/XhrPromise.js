// @flow

class XhrPromise extends Promise<XMLHttpRequest> {
    xhr: XMLHttpRequest;

    constructor(fn: any, req: XMLHttpRequest) {
        super(fn);
        this.xhr = req;
    }
}

export default XhrPromise;
