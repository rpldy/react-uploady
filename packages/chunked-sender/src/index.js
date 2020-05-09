// @flow
import createChunkedSender from "./chunkedSender";
import getChunkedEnhancer from "./getChunkedEnhancer";
import { CHUNKING_SUPPORT } from "./utils";
import { CHUNKED_SENDER_TYPE } from "./consts";

export default getChunkedEnhancer;

export {
    getChunkedEnhancer,
    createChunkedSender,
    CHUNKING_SUPPORT,
    CHUNKED_SENDER_TYPE,
};

export type {
    ChunkedOptions,
    MandatoryChunkedOptions,
    ChunkedSender,
    ChunkEventData
} from "./types";

export type {
    OnProgress,
    SendOptions,
    SendResult,
} from "@rpldy/sender";
