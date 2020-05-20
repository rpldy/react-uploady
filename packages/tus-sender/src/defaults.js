// @flow
import { devFreeze } from "@rpldy/shared";

export const DEFAULT_OPTIONS = devFreeze({
    featureDetection: false,
    version: "1.0.0",
	resume: true,
	overrideMethod: false,
    deferLength: false,
	sendDataOnCreate: false,
    storagePrefix: "__rpldy-tus__",
    lockedRetryDelay: 2000,
});
