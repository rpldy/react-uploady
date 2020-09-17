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
import type { BatchItem } from "@rpldy/shared";
import type { OnProgress, SendResult } from "@rpldy/sender";
import type { TriggerMethod } from "@rpldy/life-events";
import type { ChunkStartEventData } from "../types";
import type { Chunk, State } from "./types";
import ChunkedSendError from "./ChunkedSendError";

const getContentRangeValue = (chunk, data, item) =>
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
    state: State,
    item: BatchItem,
    onProgress: OnProgress,
    trigger: TriggerMethod,
): Promise<SendResult> => {
    const sendOptions = {
        ...unwrap(state.sendOptions),
        headers: {
            ...state.sendOptions.headers,
            "Content-Range": getContentRangeValue(chunk, chunk.data, item),
        }
    };

    const chunkItem = createBatchItem(chunk.data, chunk.id);

    const onChunkProgress = (e) => {
        onProgress(e, [chunk]);
    };

    const chunkIndex = state.chunks.indexOf(chunk);

    return triggerUpdater<ChunkStartEventData>(trigger, CHUNK_EVENTS.CHUNK_START, {
        item: unwrap(item),
        chunk: pick(chunk, ["id", "start", "end", "index", "attempt"]),
        chunkItem: chunkItem,
        sendOptions,
        url: state.url,
        chunkIndex,
        chunkCount: state.chunks.length,
        onProgress,
    })
        // $FlowFixMe - https://github.com/facebook/flow/issues/8215
        .then((updatedData: ChunkStartEventData & boolean) => {
            const skipChunk = (updatedData === false);

            if (skipChunk) {
                logger.debugLog(`chunkedSender.sendChunk: received false from CHUNK_START handler - skipping chunk ${chunkIndex}, item ${item.id}`);
            }

            //upload the chunk to the server
            return skipChunk ?
                getSkippedResult() :
                xhrSend([chunkItem],
                    updatedData?.url || state.url,
                    mergeWithUndefined({}, sendOptions, updatedData && updatedData.sendOptions),
                    onChunkProgress);
        });
};

export default (
	chunk: Chunk,
	state: State,
	item: BatchItem,
	onProgress: OnProgress,
	trigger: TriggerMethod,
): SendResult => {
	if (!chunk.data) {
		//slice the chunk based on bit position
		chunk.data = getChunkDataFromFile(item.file, chunk.start, chunk.end);
	}

	if (!chunk.data) {
		throw new ChunkedSendError("chunk failure - failed to slice");
	}

	logger.debugLog(`chunkedSender.sendChunk: about to send chunk ${chunk.id} [${chunk.start}-${chunk.end}] to: ${state.url}`);

	const chunkXhrRequest = uploadChunkWithUpdatedData(chunk, state, item, onProgress, trigger);

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
