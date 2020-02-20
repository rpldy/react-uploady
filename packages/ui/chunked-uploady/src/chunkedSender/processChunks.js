// @flow
import { throttle } from "lodash";
import { logger } from "@rpldy/shared";
import getChunks from "./getChunks";
import sendChunks from "./sendChunks";

import type { BatchItem, OnProgress, SendOptions, SendResult } from "@rpldy/shared";
import type { MandatoryChunkedOptions } from "../types";
import type { State, ChunksSendResponse, Chunk } from "./types";

export const abortChunkedRequest = (state: State, item: BatchItem) => {
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
    onProgress: OnProgress
): ChunksSendResponse => {
    const onChunkProgress = throttle(
        (e, { id }: Chunk) => {

            state.uploaded[id] = e.loaded;

            const loaded = Object.keys(state.uploaded)
                .reduce((res, id) =>
                    res + state.uploaded[id], 0);

            onProgress({ loaded, total: item.file.size }, [item]);
        },
        100);

    const sendPromise = new Promise((resolve) => {
        sendChunks(state, item, onChunkProgress, resolve);
    });

    return {
        sendPromise,
        abort: () => abortChunkedRequest(state, item),
    };
};

export default (
    item: BatchItem,
    chunkedOptions: MandatoryChunkedOptions,
    url: string,
    sendOptions: SendOptions,
    onProgress: OnProgress
): SendResult => {
    const chunks = getChunks(item, chunkedOptions);
    logger.debugLog(`chunkedSender: created ${chunks.length} chunks for: ${item.file.name}`);

    const state = {
        finished: false,
        aborted: false,
        uploaded: {},
        requests: {},
        responses: [],
        chunks,
        url,
        sendOptions,
        ...chunkedOptions,
    };

    const { sendPromise, abort } = process(state, item, onProgress);

    return {
        request: sendPromise,
        abort,
    };
};

