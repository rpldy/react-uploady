// @flow

import { logger } from "@rpldy/shared";
import send from "@rpldy/sender";
import { getMandatoryOptions } from "../utils";
import processChunks from "./processChunks";

import type { BatchItem, OnProgress, SendOptions, SendResult } from "@rpldy/shared";
import type { ChunkedOptions } from "../types";

export default (chunkedOptions: ?ChunkedOptions) => {
	chunkedOptions = getMandatoryOptions(chunkedOptions);

	return (items: BatchItem[], url: string, sendOptions: SendOptions, onProgress: OnProgress): SendResult => {
		let result;

		if (!chunkedOptions.chunked || items.length > 1 || items[0].url) {
			logger.debugLog(`ChunkedUploady.sender: sending items as normal, un-chunked requests`);
			result = send(items, url, sendOptions, onProgress);
		} else {
			logger.debugLog(`ChunkedUploady.sender: sending file as a chunked request`);
			result = processChunks(items[0], chunkedOptions, url, sendOptions, onProgress);
		}

		return result;
	};
};