// @flow
export default class MissingUrlError extends Error {
    constructor(senderType: string) {
        super(`${senderType} didn't receive upload URL`);
        this.name = "MissingUrlError";
    }
}
