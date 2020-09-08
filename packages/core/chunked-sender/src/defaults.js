// @flow
import { devFreeze } from "@rpldy/shared";

export const DEFAULT_OPTIONS = devFreeze({
    chunked: true,
    chunkSize: 5242880,
    retries: 0,
    parallel: 1
});
