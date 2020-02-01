// @flow

import { createBatchItem, logger } from "@rpldy/shared";
import send from "@rpldy/sender";
import { getChunkDataFromFile } from "../utils";

import type { BatchItem, OnProgress, SendOptions, SendResult } from "@rpldy/shared";
import type { Chunk } from "./types";

export default (
	chunk: Chunk,
	item: BatchItem,
	url: string,
	sendOptions: SendOptions,
	onProgress: OnProgress,
): SendResult => {

	if (!chunk.data) {
		//slice the chunk based on byte position
		chunk.data = getChunkDataFromFile(item.file, chunk.start, chunk.end);
	}

	const chunkItem = createBatchItem(chunk.data, chunk.id);

	logger.debugLog(`chunkedSender: about to send chunk ${chunk.id} to: ${url}`);

	//TODO:  CONTENT RANGE HEADER !!!!!!!!!!!!!!!!!


	return send([chunkItem], url, sendOptions, onProgress);
};