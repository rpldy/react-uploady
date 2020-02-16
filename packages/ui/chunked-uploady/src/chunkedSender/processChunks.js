// @flow
import { logger } from "@rpldy/shared";
import getChunks from "./getChunks";
import sendChunks from "./sendChunks";

import type { BatchItem, OnProgress, SendOptions, SendResult } from "@rpldy/shared";
import type { MandatoryChunkedOptions } from "../types";
import type { State, ChunksSendResponse } from "./types";

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
	const onChunkProgress = (e) => {
		state.uploaded += e.loaded;
		onProgress({ loaded: state.uploaded, total: item.file.size }, [item]);
	};

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
		uploaded: 0,
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

