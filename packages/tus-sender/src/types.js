// @flow
import type { ChunkedOptions } from "@rpldy/chunked-sender";

export type TusOptions = {
    ...ChunkedOptions,
    //whether to perform OPTIONS request in beginning of session (default: false)
    //returned results will override some of the options
    featureDetection?: boolean,
    //TUS server version (default: "1.0.0")
    version?: string,
    // //TUS server extensions - override feature detection
    // extensions?: string[],

    //whether to resume an incomplete upload in case a local key is found
    resume: boolean,
};


