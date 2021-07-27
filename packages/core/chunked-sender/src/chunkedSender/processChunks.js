// @flow
import { logger } from "@rpldy/shared";
import getChunks from "./getChunks";
import sendChunks from "./sendChunks";
import { CHUNKED_SENDER_TYPE } from "../consts";
import processChunkProgressData from "./processChunkProgressData";

import type { BatchItem } from "@rpldy/shared";
import type { OnProgress, SendResult } from "@rpldy/sender";
import type { TriggerMethod } from "@rpldy/life-events";
import type { MandatoryChunkedOptions, ChunkedSendOptions } from "../types";
import type { State, ChunksSendResponse, Chunk } from "./types";

export const abortChunkedRequest = (state: State, item: BatchItem): boolean => {
    logger.debugLog(`chunkedSender: aborting chunked upload for item: ${item.id}`);

    if (!state.finished && !state.aborted) {
        Object.keys(state.requests)
            .forEach((chunkId) => {
                logger.debugLog(`chunkedSender: aborting chunk: ${chunkId}`);
                state.requests[chunkId].abort();
            });

        state.aborted = true;
    }

    return state.aborted;
};

export const process = (
    state: State,
    item: BatchItem,
    onProgress: OnProgress,
    trigger: TriggerMethod,
): ChunksSendResponse => {
    const onChunkProgress = (e, chunks: Chunk[]) => {
        //we only ever send one chunk per request
        const progressData = processChunkProgressData(state, item, chunks[0].id, e.loaded);
        onProgress(progressData, [item]);
    };

    const sendPromise = new Promise((resolve) => {
        sendChunks(state, item, onChunkProgress, resolve, trigger);
    });

    return {
        sendPromise,
        abort: () => abortChunkedRequest(state, item),
    };
};

const processChunks = (
    item: BatchItem,
    chunkedOptions: MandatoryChunkedOptions,
    url: ?string,
    sendOptions: ChunkedSendOptions,
    onProgress: OnProgress,
    trigger: TriggerMethod
): SendResult => {
    const chunks = getChunks(item, chunkedOptions, sendOptions.startByte);
    logger.debugLog(`chunkedSender: created ${chunks.length} chunks for: ${item.file.name}`);

    const state = {
        finished: false,
        aborted: false,
        error: false,
        uploaded: {},
        requests: {},
        responses: [],
        chunkCount: chunks.length,
        startByte: sendOptions.startByte || 0,
        chunks,
        url,
        sendOptions,
        ...chunkedOptions,
    };

    const { sendPromise, abort } = process(state, item, onProgress, trigger);

    return {
        request: sendPromise,
        abort,
        senderType: CHUNKED_SENDER_TYPE,
    };
};

export default processChunks;
