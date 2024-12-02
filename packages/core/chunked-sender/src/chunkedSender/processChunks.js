// @flow
import { logger } from "@rpldy/shared";
import getChunks from "./getChunks";
import sendChunks from "./sendChunks";
import { CHUNKED_SENDER_TYPE } from "../consts";
import processChunkProgressData from "./processChunkProgressData";
import getChunkedState from "./getChunkedState";

import type { BatchItem, UploadData } from "@rpldy/shared";
import type { OnProgress, SendResult, SenderProgressEvent } from "@rpldy/sender";
import type { TriggerMethod } from "@rpldy/life-events";
import type { MandatoryChunkedOptions, ChunkedSendOptions } from "../types";
import type { ChunksSendResponse, Chunk, ChunkedState } from "./types";

export const abortChunkedRequest = (chunkedState: ChunkedState, item: BatchItem): boolean => {
    logger.debugLog(`chunkedSender: aborting chunked upload for item: ${item.id}`);
    const state = chunkedState.getState();

    if (!state.finished && !state.aborted) {
        Object.keys(state.requests)
            .forEach((chunkId) => {
                logger.debugLog(`chunkedSender: aborting chunk: ${chunkId}`);
                state.requests[chunkId].abort();
            });

        chunkedState.updateState((state) => {
            state.aborted = true;
        });
    }

    return state.aborted;
};

export const startProcessing = (
    chunkedState: ChunkedState,
    item: BatchItem,
    onProgress: OnProgress,
    trigger: TriggerMethod,
): ChunksSendResponse => {
    const onChunkProgress = (e: SenderProgressEvent, chunks: Chunk[]) => {
        //we only ever send one chunk per request
        const progressData = processChunkProgressData(chunkedState, item, chunks[0].id, e.loaded);
        onProgress(progressData, [item]);
    };

    const sendPromise = new Promise<UploadData>((resolve) => {
        sendChunks(chunkedState, item, onChunkProgress, resolve, trigger);
    });

    return {
        sendPromise,
        abort: () => abortChunkedRequest(chunkedState, item),
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
    const chunkedState = getChunkedState(chunks, url, sendOptions, chunkedOptions);

    logger.debugLog(`chunkedSender: created ${chunks.length} chunks for: ${item.file.name}.`);

    const { sendPromise, abort } = startProcessing(chunkedState, item, onProgress, trigger);

    return {
        request: sendPromise,
        abort,
        senderType: CHUNKED_SENDER_TYPE,
    };
};

export default processChunks;
