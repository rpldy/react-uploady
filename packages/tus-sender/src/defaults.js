// @flow
import { devFreeze } from "@rpldy/shared";

export const DEFAULT_OPTIONS = devFreeze({
    resume: true,
    featureDetection: false,
    version: "1.0.0",
    // extensions: null,
    deferLength: false,

    storagePrefix: "__rpldy-tus__",
    lockedRetryDelay: 2000,
});
