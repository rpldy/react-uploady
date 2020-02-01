// @flow
import { logger } from "@rpldy/shared";
import getChunks from "./getChunks";
import sendChunks from "./sendChunks";

import type { BatchItem, OnProgress, SendOptions, SendResult } from "@rpldy/shared";
import type { MandatoryChunkedOptions } from "../types";
import type { State, ChunksSendResponse } from "./types";

export const process = (
	state: State,
	item: BatchItem,
	onProgress: OnProgress
): ChunksSendResponse => {
	const abort = () => {

		//TODO: abort all pending/in-progress chunk requests
	};

	const handleChunkOnProgress = (e, items) => {

		//TODO: calculate overall progress and call onProgress !!!

		//onProgress()
	};

	const sendPromise = new Promise((resolve) => {
		sendChunks(state, item, handleChunkOnProgress, resolve);
	});

	sendPromise.then((result) => {

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

