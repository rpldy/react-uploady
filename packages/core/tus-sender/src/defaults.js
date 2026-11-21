// @flow
import { devFreeze } from "@rpldy/shared";
import { CHUNKED_DEFAULT_OPTIONS } from "@rpldy/chunked-sender";
import type { TusOptions } from "./types";

export const DEFAULT_OPTIONS: { ...TusOptions, storagePrefix: string } = devFreeze({
	...CHUNKED_DEFAULT_OPTIONS,
    featureDetection: false,
	featureDetectionUrl: null,
    version: "1.0.0",
	resume: true,
	overrideMethod: false,
    deferLength: false,
	sendDataOnCreate: false,
    storagePrefix: "__rpldy-tus__",
    lockedRetryDelay: 2000,
	forgetOnSuccess: false,
	ignoreModifiedDateInStorage: false,
});
