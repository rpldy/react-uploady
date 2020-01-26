// @flow
import { logger } from "@rpldy/shared";
import send from "@rpldy/sender";

import type { BatchItem, OnProgress, SendOptions, SendResult } from "@rpldy/shared";
import type { MandatoryChunkedOptions } from "../types";

type Chunk = {
	id: string,
	start: number,
	end: number,
	// size: number,
	data: ?Blob,
	attempt: number,
};

export const getChunks = (item: BatchItem, options: MandatoryChunkedOptions): Chunk[] => {

	const { chunkSize } = options,
		count = Math.ceil(item.file.size / chunkSize);

	return new Array(count).fill(null)
		.map((n, index) => {
			const start = (chunkSize * index);

			return {
				id: item.id + `_chunk-${index}`,
				start,
				end: Math.min((start + chunkSize), item.file.size),
				data: null,
				attempt: 0,
			};
		});
};

// const sendChunk = (
// 	chunk: Chunk,
// 	item: BatchItem,
// 	retryChunk: ()=> void,
// 	// chunkRequests,
// 	// chunkedOptions: MandatoryChunkedOptions,
// 	// url: string,
// 	// sendOptions: SendOptions
// ) => {
//
// 	send()
//
//
// };

// const retryChunk = (state) => {
//
// };

class ChunkedSendError extends Error {
	constructor(message) {
		super(message);
		this.name = "ChunkedSendError";
	}
}

const getChunksToSend = (state) => {
	const chunks = [],
		inProgressIds = Object.keys(state.requests);

	for (let i = 0; i < state.chunks.length && chunks.length < state.parallel; i++) {
		const chunk = state.chunks[i];

		if (!inProgressIds.includes(chunk.id)) {
			if (!chunk.attempt || chunk.attempt < state.retries) {
				chunks.push(chunk);
			} else {
				throw new ChunkedSendError("chunk failure");
			}
		}
	}

	return chunks;
};

const sendChunks = (
	item: BatchItem,
	state,
	onProgress: OnProgress,
	resolve,
) => {

	if (!state.finished && !state.aborted) {
		if (!state.requests.length ||
			(state.parallel && state.parallel > state.requests.length)) {

			let chunks;

			try {
				chunks = getChunksToSend(state);
			} catch (ex) {
				if (ex instanceof ChunkedSendError) {

					//TODO: abort request in case one chunk failed more than retries allowed

					resolve();
				}
				else{
					throw ex;
				}
			}

			if (chunks) {
				chunks.forEach((chunk) => {

				});
			}

			//TODO: remove successfully finished chunks from state

		}
	}
};

const processChunks = (
	chunks: Chunk[],
	chunkedOptions: MandatoryChunkedOptions,
	item: BatchItem,
	url: string,
	sendOptions: SendOptions,
	onProgress: OnProgress
) => {
	const state = {
		finished: false,
		aborted: false,
		requests: {},
		chunks,
		url,
		sendOptions,
		...chunkedOptions,
	};

	const abort = () => {

		//TODO: abort all pending/in-progress chunk requests
	};

	const sendPromise = new Promise((resolve) => {
		sendChunks(chunks, item, state, onProgress, resolve);
	});

	return {
		sendPromise,
		abort,
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

	const { sendPromise, abort } = processChunks(chunks, item, chunkedOptions, url, sendOptions, onProgress);

	return {
		request: sendPromise,
		abort,
	};
};

