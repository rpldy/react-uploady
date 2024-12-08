// @flow
import {
	triggerUpdater,
	createBatchItem,
	logger,
	getMerge,
	pick,
	FILE_STATES
} from "@rpldy/shared";
import { unwrap } from "@rpldy/simple-state";
import xhrSend from "@rpldy/sender";
import { getChunkDataFromFile } from "../utils";
import { CHUNK_EVENTS } from "../consts";
import ChunkedSendError from "./ChunkedSendError";

import type { BatchItem } from "@rpldy/shared";
import type { OnProgress, SendResult, SenderProgressEvent } from "@rpldy/sender";
import type { TriggerMethod } from "@rpldy/life-events";
import type { ChunkStartEventData } from "../types";
import type { Chunk, ChunkedState } from "./types";

const getContentRangeValue = (chunk: Chunk, data: ?Blob, item: BatchItem) =>
	data && `bytes ${chunk.start}-${chunk.start + data.size - 1}/${item.file.size}`;

const mergeWithUndefined = getMerge({ undefinedOverwrites: true });

const getSkippedResult = (): SendResult => ({
	request: Promise.resolve({
		state: FILE_STATES.FINISHED,
		response: "skipping chunk as instructed by CHUNK_START handler",
		status: 200,
	}),
	abort: () => true,
	//passthrough type
	senderType: "chunk-skipped-sender",
});

const uploadChunkWithUpdatedData = (
    chunk: Chunk,
    chunkedState: ChunkedState,
    item: BatchItem,
    onProgress: OnProgress,
    trigger: TriggerMethod,
): Promise<SendResult> => {
    const state = chunkedState.getState();
    const unwrappedOptions = unwrap(state.sendOptions);
    const sendOptions = {
        ...unwrappedOptions,
        headers: {
            ...unwrappedOptions.headers,
            "Content-Range": getContentRangeValue(chunk, chunk.data, item),
        }
    };

    const chunkItem = createBatchItem(chunk.data, chunk.id);

    const onChunkProgress = (e: SenderProgressEvent) => {
        onProgress(e, [chunk]);
    };

    const chunkIndex = state.chunks.indexOf(chunk);

    return triggerUpdater<ChunkStartEventData>(trigger, CHUNK_EVENTS.CHUNK_START, {
        item: unwrap(item),
        chunk: pick(chunk, ["id", "start", "end", "index", "attempt"]),
        chunkItem: { ...chunkItem },
        sendOptions,
        url: state.url,
        chunkIndex,
        remainingCount: state.chunks.length,
        totalCount: state.chunkCount,
        //TODO: should expose chunk_progress event instead of passing callback like this
        onProgress,
    })
        // $FlowFixMe - https://github.com/facebook/flow/issues/8215
        .then((response: ChunkStartEventData | boolean) => {
            let result;
            const updatedData = typeof response === "boolean" ? (response === false ? { stop: true } : {}) : response;

            if (updatedData.stop) {
                logger.debugLog(`chunkedSender.sendChunk: received false from CHUNK_START handler - skipping chunk ${chunkIndex}, item ${item.id}`);
                result = getSkippedResult();
            } else {
                result = xhrSend([chunkItem],
                    updatedData?.url || state.url,
                    mergeWithUndefined({}, sendOptions, updatedData?.sendOptions),
                    onChunkProgress);
            }

            return result;
        });
};

const sendChunk = (
    chunk: Chunk,
    chunkedState: ChunkedState,
    item: BatchItem,
    onProgress: OnProgress,
    trigger: TriggerMethod,
): SendResult => {
    if (!chunk.data) {
        //slice the chunk based on bit position
        chunkedState.updateState((state) => {
            chunk.data = getChunkDataFromFile(item.file, chunk.start, chunk.end);
        });
    }

    if (!chunk.data) {
        throw new ChunkedSendError("chunk failure - failed to slice");
    }

    const url = chunkedState.getState().url;

    logger.debugLog(`chunkedSender.sendChunk: about to send chunk ${chunk.id} [${chunk.start}-${chunk.end}] to: ${url || ""}`);

    const chunkXhrRequest = uploadChunkWithUpdatedData(chunk, chunkedState, item, onProgress, trigger);

    const abort = () => {
        chunkXhrRequest.then(({ abort }) => abort());
        return true;
    };

    return {
        request: chunkXhrRequest.then(({ request }) => request),
        abort,
        //this type isnt relevant because it isnt exposed
        senderType: "chunk-passthrough-sender",
    };
};

export default sendChunk;
