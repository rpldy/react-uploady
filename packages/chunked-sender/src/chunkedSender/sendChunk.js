// @flow
import { triggerUpdater, createBatchItem, logger, getMerge, pick } from "@rpldy/shared";
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
    `bytes ${chunk.start}-${chunk.start + data.size - 1}/${item.file.size}`;

const mergeWithUndefined = getMerge({ undefinedOverwrites: true });

const uploadChunkWithUpdatedData = async (
	chunk: Chunk,
	state: State,
	item: BatchItem,
	onProgress: OnProgress,
	trigger: TriggerMethod,
): Promise<SendResult> => {
	const data = chunk.data; //things we do for flow...

	const sendOptions = {
		...state.sendOptions,
		headers: {
			...state.sendOptions.headers,
			"Content-Range": getContentRangeValue(chunk, data, item),
		}
	};

	const chunkItem = createBatchItem(data, chunk.id);

	const onChunkProgress = (e) => {
		onProgress(e, [chunk]);
	};

	const chunkIndex = state.chunks.indexOf(chunk);

	// $FlowFixMe - https://github.com/facebook/flow/issues/8215
	const updatedData = await triggerUpdater<ChunkStartEventData>(trigger, CHUNK_EVENTS.CHUNK_START, {
		item,
		chunk: pick(chunk, ["id", "start", "end"]),
		chunkItem,
		sendOptions,
		url: state.url,
		chunkIndex,
		chunkCount: state.chunks.length,
		onProgress,
	});

	//upload the chunk to the server
	return xhrSend(
		[chunkItem],
		updatedData?.url || state.url,
		mergeWithUndefined({}, sendOptions, updatedData?.sendOptions),
		onChunkProgress);
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
