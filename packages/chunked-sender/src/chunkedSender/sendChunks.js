// @flow
import { FILE_STATES, logger } from "@rpldy/shared";
import ChunkedSendError from "./ChunkedSendError";
import handleChunkRequest from "./handleChunkRequest";
import getChunksToSend from "./getChunksToSend";
import sendChunk from "./sendChunk";

import type { BatchItem } from "@rpldy/shared";
import type { OnProgress } from "@rpldy/sender";
import type { Chunk, State } from "./types";

const resolveOnError = (resolve, ex) => {
    if (ex instanceof ChunkedSendError) {
        resolve({
            state: FILE_STATES.ERROR,
            response: "At least one chunk failed",
        });
    } else {
        resolve({
            state: FILE_STATES.ERROR,
            response: ex.message,
        });
    }
};

const resolveOnChunksFinished = (state: State, item: BatchItem, resolve): boolean => {
    const finished = !state.chunks.length;

    if (finished && !state.error) {
        state.finished = true;

        logger.debugLog(`chunkedSender: chunked upload finished for item: ${item.id}`, state.responses);

        resolve({
            state: FILE_STATES.FINISHED,
            response: state.responses,
        });
    }

    return finished || state.error;
};

export const handleChunk = async (state: State, item: BatchItem, onProgress: OnProgress, resolve: (any) => void, chunk: Chunk) => {
    const chunkSendResult = sendChunk(chunk, item, state.url, state.sendOptions, onProgress);
    await handleChunkRequest(state, chunk.id, chunkSendResult);

    if (!resolveOnChunksFinished(state, item, resolve)) {
        sendChunks(state, item, onProgress, resolve);
    }
};

const sendChunks = async (
    state: State,
    item: BatchItem,
    onProgress: OnProgress,
    resolve: (any) => void,
) => {
    if (!state.finished && !state.aborted) {
        const inProgress = Object.keys(state.requests).length;

        if (!inProgress ||
            (state.parallel && state.parallel > inProgress)) {

            let chunks;

            try {
                chunks = getChunksToSend(state);
            } catch (ex) {
                resolveOnError(resolve, ex);
            }

            if (chunks) {
                chunks.forEach((chunk) => {
                    handleChunk(state, item, onProgress, resolve, chunk)
                        .catch((ex) => {
                            state.error = true;
                            resolveOnError(resolve, ex);
                        });
                });
            }
        }
    }
};

export default sendChunks;
