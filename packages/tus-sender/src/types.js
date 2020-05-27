// @flow
import type { ChunkedOptions } from "@rpldy/chunked-sender";
import type { ItemInfo } from "./tusSender/types";

export type TusOptions = {
    ...ChunkedOptions,
	//TUS server version (default: "1.0.0")
	version?: string,
	//whether to perform OPTIONS request in beginning of session (default: false)
    //returned results may override some of the options
    featureDetection?: boolean,
	//URL to query for TUS server feature detection, in case different from upload URL (default: null)
	featureDetectionUrl?: ?string,
    //optional callback to return different options based on server declared extensions
	onFeaturesDetected?: (string[]) => ?TusOptions,
	//whether to resume an incomplete upload in case a local key is found
	resume?: boolean,
    //https://tus.io/protocols/resumable-upload.html#upload-defer-length (default: false)
    deferLength?: boolean,
    //whether to use X-HTTP-Method-Override header instead of PATCH (default: false)
    overrideMethod?: boolean,
	//whether to send data already with the creation request (default: false)
	sendDataOnCreate?: boolean,
    //the key prefix to use for persisting resumable info about files (default: "__rpldy-tus__")
    storagePrefix?: string,
    //milliseconds to wait before retrying a locked resumable file (default: 2000)
    lockedRetryDelay?: number,
	//whether to remove URL from localStorage when upload finishes successfully (default: false)
	forgetOnSuccess?: boolean,
};

export type RequestResult<T> = {
	request: Promise<T>,
	abort: () => boolean,
}

export type State = {
	options: TusOptions,
	items: { [string]: ItemInfo },
	featureDetection: {
		extensions: ?string,
		version: ?string,
		processed: boolean,
	},
};

export type TusState = {
	getState: () => State,
	updateState: ((State) => void) => State,
};