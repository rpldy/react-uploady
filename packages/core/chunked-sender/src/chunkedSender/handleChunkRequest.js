// @flow
import { FILE_STATES, logger, pick } from "@rpldy/shared";
import { unwrap } from "@rpldy/simple-state";
import { CHUNK_EVENTS } from "../consts";

import type { BatchItem, UploadData } from "@rpldy/shared";
import type { OnProgress, SendResult } from "@rpldy/sender";
import type { TriggerMethod } from "@rpldy/life-events";
import type { ChunkedState } from "./types";

const handleChunkRequest = (
    chunkedState: ChunkedState,
    item: BatchItem,
    chunkId: string,
    chunkSendResult: SendResult,
    trigger: TriggerMethod,
    onProgress: OnProgress,
): Promise<void> => {
    chunkedState.updateState((state) => {
        state.requests[chunkId] = {
            id: chunkId,
            abort: chunkSendResult.abort,
        };
    });

    return chunkSendResult.request
        .then((result: UploadData) => {
            logger.debugLog(`chunkedSender: request finished for chunk: ${chunkId} - `, result);

            chunkedState.updateState((state) => {
                delete state.requests[chunkId];
            });

            const chunks = chunkedState.getState().chunks;
            const index = chunks.findIndex((c) => c.id === chunkId);

            if (~index) {
                if (result.state === FILE_STATES.FINISHED) {
                    const finishedChunk = chunks[index];

                    chunkedState.updateState((state) => {
                        //remove chunk so eventually there are no more chunks to send
                        state.chunks = state.chunks.slice(0, index)
                            .concat(state.chunks.slice(index + 1));
                    });

                    const chunkSize = finishedChunk.end - finishedChunk.start;

                    //issue progress event when chunk finished uploading, so item progress data is updated
                    onProgress({ loaded: chunkSize, total: item.file.size }, [finishedChunk]);

                    trigger(CHUNK_EVENTS.CHUNK_FINISH, {
                        chunk: pick(finishedChunk, ["id", "start", "end", "index", "attempt"]),
                        item: unwrap(item),
                        uploadData: result,
                    });
                } else if (result.state !== FILE_STATES.ABORTED) {
                    //increment attempt in case chunk failed (and not aborted)
                    chunkedState.updateState((state) => {
                        state.chunks[index].attempt += 1;

                        state.lastChunkErrorData = {
                            status: result.status,
                            response: result.response,
                        };
                    });
                }

                chunkedState.updateState((state) => {
                    state.responses.push(result.response);
                });
            }
        });
};

export default handleChunkRequest;
