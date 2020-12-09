// @flow
import { FILE_STATES, logger } from "@rpldy/shared";
import ChunkedSendError from "./ChunkedSendError";
import handleChunkRequest from "./handleChunkRequest";
import getChunksToSend from "./getChunksToSend";
import sendChunk from "./sendChunk";

import type { BatchItem, FileState } from "@rpldy/shared";
import type { OnProgress } from "@rpldy/sender";
import type { TriggerMethod } from "@rpldy/life-events";
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

const finalizeOnFinish = (state: State, item: BatchItem, resolve, status: FileState) => {
    state.finished = true;

    resolve({
        state: status,
        response: { results: state.responses },
    });
};

const resolveOnAllChunksFinished = (state: State, item: BatchItem, resolve): boolean => {
    const finished = !state.chunks.length;

    if (state.aborted) {
        logger.debugLog(`chunkedSender: chunked upload aborted for item: ${item.id}`);
        finalizeOnFinish(state, item, resolve, FILE_STATES.ABORTED);
    } else if (finished && !state.error) {
        logger.debugLog(`chunkedSender: chunked upload finished for item: ${item.id}`, state.responses);
        finalizeOnFinish(state, item, resolve, FILE_STATES.FINISHED);
    }

    return finished || state.error;
};

export const handleChunk = (
    state: State,
    item: BatchItem,
    onProgress: OnProgress,
    chunkResolve: (any) => void,
    chunk: Chunk,
    trigger: TriggerMethod
): Promise<void> =>
    new Promise((resolve, reject) => {
        try {
            const chunkSendResult = sendChunk(chunk, state, item, onProgress, trigger);

            handleChunkRequest(state, item, chunk.id, chunkSendResult, trigger)
                .then(() => {
                    resolve();

                    if (!resolveOnAllChunksFinished(state, item, chunkResolve)) {
                        //not finished - continue sending remaining chunks
                        sendChunks(state, item, onProgress, chunkResolve, trigger);
                    }
                });
        } catch (ex) {
            reject(ex);
        }
    });

const sendChunks = (
    state: State,
    item: BatchItem,
    onProgress: OnProgress,
    resolve: (any) => void,
    trigger: TriggerMethod,
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
                    handleChunk(state, item, onProgress, resolve, chunk, trigger)
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
