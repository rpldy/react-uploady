// @flow

import { createBatchItem, logger } from "@rpldy/shared";
import send from "@rpldy/sender";
import { getChunkDataFromFile } from "../utils";

import type { BatchItem, OnProgress, SendOptions, SendResult } from "@rpldy/shared";
import type { Chunk } from "./types";

const getContentRangeValue = (chunk, item) =>
	`bytes ${chunk.start}-${chunk.end}/${item.file.size}`;

export default (
	chunk: Chunk,
	item: BatchItem,
	url: string,
	sendOptions: SendOptions,
	onProgress: OnProgress,
): SendResult => {

	if (!chunk.data) {
		//slice the chunk based on bit position
		const chunkEnd = (chunk.end + 1); // Math.min((chunk.end + 1), item.file.size);
		chunk.data = getChunkDataFromFile(item.file, chunk.start, chunkEnd);
	}

	const chunkItem = createBatchItem(chunk.data, chunk.id);

	logger.debugLog(`chunkedSender: about to send chunk ${chunk.id} to: ${url}`);

	sendOptions = {
		...sendOptions,
		headers: {
			...sendOptions.headers,
			"Content-Range": getContentRangeValue(chunk, item),
			"X-Unique-Upload-Id": "test-chunk-2"
		}
	};

	return send([chunkItem], url, sendOptions, onProgress);
};