// @flow
import type { ChunkedOptions } from "@rpldy/chunked-sender";

export type TusOptions = {
    ...ChunkedOptions,
    // //the server path to add to the destination url for upload (default: undefined)
    // path?: string,
    //whether to perform OPTIONS request in beginning of session (default: false)
    //returned results will override some of the options
    featureDetection?: boolean,
    //TUS server version (default: "1.0.0")
    version?: string,
    // //TUS server extensions - override feature detection
    // extensions?: string[],
    //whether to resume an incomplete upload in case a local key is found
    resume: boolean,
    //https://tus.io/protocols/resumable-upload.html#upload-defer-length (default: false)
    deferLength?: boolean,
    //whether to use X-HTTP-Method-Override header instead of PATCH (default: false)
    overrideMethod?: boolean,
    //the key prefix to use for persisting resumable info about files (default: "__tus-resumable__")
    storagePrefix?: string,
};


