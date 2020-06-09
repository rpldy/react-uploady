// @flow
import createChunkedSender from "./chunkedSender";
import getChunkedEnhancer from "./getChunkedEnhancer";
import { CHUNKING_SUPPORT, getChunkDataFromFile } from "./utils";
import { CHUNK_EVENTS, CHUNKED_SENDER_TYPE } from "./consts";
import { DEFAULT_OPTIONS as CHUNKED_DEFAULT_OPTIONS } from "./defaults";

export default getChunkedEnhancer;

export {
    CHUNK_EVENTS,
    CHUNKING_SUPPORT,
    CHUNKED_SENDER_TYPE,
	CHUNKED_DEFAULT_OPTIONS,

    getChunkedEnhancer,
    createChunkedSender,
	getChunkDataFromFile,
};

export type {
    ChunkedOptions,
    MandatoryChunkedOptions,
    ChunkedSender,
	ChunkedSendOptions,
    ChunkEventData,
    ChunkStartEventData,
    ChunkFinishEventData,
} from "./types";

export type {
    OnProgress,
    SendOptions,
    SendResult,
} from "@rpldy/sender";
