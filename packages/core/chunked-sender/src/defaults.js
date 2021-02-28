// @flow
import { devFreeze } from "@rpldy/shared";

export const DEFAULT_OPTIONS: any = devFreeze({
    chunked: true,
    chunkSize: 5242880,
    retries: 0,
    parallel: 1
});
