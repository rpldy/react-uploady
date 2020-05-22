// @flow
import { devFreeze } from "@rpldy/shared";
import { CHUNKED_DEFAULT_OPTIONS } from "@rpldy/chunked-sender";

export const DEFAULT_OPTIONS = devFreeze({
	...CHUNKED_DEFAULT_OPTIONS,
    featureDetection: false,
    version: "1.0.0",
	resume: true,
	overrideMethod: false,
    deferLength: false,
	sendDataOnCreate: false,
    storagePrefix: "__rpldy-tus__",
    lockedRetryDelay: 2000,
});
