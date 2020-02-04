// @flow
import { logger } from "@rpldy/shared";
import getChunks from "./getChunks";
import sendChunks from "./sendChunks";

import type { BatchItem, OnProgress, SendOptions, SendResult } from "@rpldy/shared";
import type { MandatoryChunkedOptions } from "../types";
import type { State, ChunksSendResponse } from "./types";

export const abortChunkedRequest =  (state, item) => {
	logger.debugLog(`chunkedSender: aborting chunked upload for item: ${item.id}`);

	if (!state.finished && !state.aborted) {
		Object.keys(state.requests)
			.forEach((chunkId) => {
				logger.debugLog(`chunkedSender: aborting chunk: ${chunkId}`);
				state.requests[chunkId].abort();
			});

		state.aborted = true;
	}
};

export const process = (
	state: State,
	item: BatchItem,
	onProgress: OnProgress
): ChunksSendResponse => {
	const handleChunkOnProgress = (e, progressChunks) => {
		const loadedAverage = e.loaded / progressChunks.length;
		let loadTotal = 0;

		state.chunks.forEach((chunk) => {
			const upChunk = progressChunks.length === 1 ?
				progressChunks[0] :
				progressChunks.find((pc) => pc.id === chunk.id);

			if (chunk.id === upChunk?.id) {
				chunk.progress += loadedAverage;
			}

			loadTotal += chunk.progress;
		});

		onProgress({ loaded: loadTotal, total: item.file.size }, [item]);
	};

	const sendPromise = new Promise((resolve) => {
		sendChunks(state, item, handleChunkOnProgress, resolve);
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

