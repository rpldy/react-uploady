// @flow
import createChunkedSender from "./chunkedSender";
import getChunkedEnhancer from "./getChunkedEnhancer";
import { CHUNKING_SUPPORT } from "./utils";
import { CHUNK_EVENTS, CHUNKED_SENDER_TYPE } from "./consts";

export default getChunkedEnhancer;

export {
    CHUNK_EVENTS,
    CHUNKING_SUPPORT,
    CHUNKED_SENDER_TYPE,

    getChunkedEnhancer,
    createChunkedSender,
};

export type {
    ChunkedOptions,
    MandatoryChunkedOptions,
    ChunkedSender,
    ChunkEventData,
    ChunkStartEventData,
} from "./types";

export type {
    OnProgress,
    SendOptions,
    SendResult,
} from "@rpldy/sender";
