// @flow
import { devFreeze } from "@rpldy/shared";

export const CHUNK_EVENTS: Readonly<{ CHUNK_START: string, CHUNK_FINISH: string }> = devFreeze({
    CHUNK_START: "CHUNK_START",
    CHUNK_FINISH: "CHUNK_FINISH",
});

export const CHUNKED_SENDER_TYPE = "rpldy-chunked-sender";
