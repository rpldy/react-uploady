// @flow

function isPromise(obj: any): implies obj is Promise<any> {
    return !!obj && typeof obj === "object" && typeof obj.then === "function";
}

export default isPromise;

