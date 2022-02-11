// @flow
import { FILE_STATES, logger } from "@rpldy/shared";
import ChunkedSendError from "./ChunkedSendError";
import handleChunkRequest from "./handleChunkRequest";
import getChunksToSend from "./getChunksToSend";
import sendChunk from "./sendChunk";

import type { BatchItem, FileState } from "@rpldy/shared";
import type { OnProgress } from "@rpldy/sender";
import type { TriggerMethod } from "@rpldy/life-events";
import type { Chunk, ChunkedState } from "./types";

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

const finalizeOnFinish = (chunkedState: ChunkedState, item: BatchItem, resolve, status: FileState) => {
    chunkedState.updateState((state) => {
        state.finished = true;
    });

    resolve({
        state: status,
        response: { results: chunkedState.getState().responses },
    });
};

const resolveOnAllChunksFinished = (chunkedState: ChunkedState, item: BatchItem, resolve): boolean => {
    const state = chunkedState.getState();
    const finished = !state.chunks.length;

    if (state.aborted) {
        logger.debugLog(`chunkedSender: chunked upload aborted for item: ${item.id}`);
        finalizeOnFinish(chunkedState, item, resolve, FILE_STATES.ABORTED);
    } else if (finished && !state.error) {
        logger.debugLog(`chunkedSender: chunked upload finished for item: ${item.id}`, state.responses);
        finalizeOnFinish(chunkedState, item, resolve, FILE_STATES.FINISHED);
    }

    return finished || state.error;
};

export const handleChunk = (
    chunkedState: ChunkedState,
    item: BatchItem,
    onProgress: OnProgress,
    chunkResolve: (any) => void,
    chunk: Chunk,
    trigger: TriggerMethod
): Promise<void> =>
    new Promise((resolve, reject) => {
        try {
            const chunkSendResult = sendChunk(chunk, chunkedState, item, onProgress, trigger);

            handleChunkRequest(chunkedState, item, chunk.id, chunkSendResult, trigger, onProgress)
                .then(() => {
                    resolve();

                    if (!resolveOnAllChunksFinished(chunkedState, item, chunkResolve)) {
                        //not finished - continue sending remaining chunks
                        sendChunks(chunkedState, item, onProgress, chunkResolve, trigger);
                    }
                });
        } catch (ex) {
            reject(ex);
        }
    });

const sendChunks = (
    chunkedState: ChunkedState,
    item: BatchItem,
    onProgress: OnProgress,
    resolve: (any) => void,
    trigger: TriggerMethod,
) => {
    const state = chunkedState.getState();

    if (!state.finished && !state.aborted) {
        const inProgress = Object.keys(state.requests).length;

        if (!inProgress ||
            (state.parallel && state.parallel > inProgress)) {

            let chunks;

            try {
                chunks = getChunksToSend(chunkedState);
            } catch (ex) {
                resolveOnError(resolve, ex);
            }

            if (chunks) {
                chunks.forEach((chunk) => {
                    handleChunk(chunkedState, item, onProgress, resolve, chunk, trigger)
                        .catch((ex) => {
                            chunkedState.updateState((state) => {
                                state.error = true;
                            });

                            resolveOnError(resolve, ex);
                        });
                });
            }
        }
    }
};

export default sendChunks;
