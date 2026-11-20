// @flow
import { devFreeze } from "@rpldy/shared";

export const CHUNK_EVENTS: any = devFreeze({
    CHUNK_START: "CHUNK_START",
    CHUNK_FINISH: "CHUNK_FINISH",
});

export const CHUNKED_SENDER_TYPE = "rpldy-chunked-sender";
