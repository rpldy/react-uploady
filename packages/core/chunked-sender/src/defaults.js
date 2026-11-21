// @flow
import { devFreeze } from "@rpldy/shared";
import type { MandatoryChunkedOptions } from "./types";

export const DEFAULT_OPTIONS: MandatoryChunkedOptions = devFreeze({
    chunked: true,
    chunkSize: 5242880,
    retries: 0,
    parallel: 1,
    sendWithRangeHeader: true,
});
