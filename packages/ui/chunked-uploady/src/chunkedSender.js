// @flow
import { logger } from "@rpldy/shared";
import send from "@rpldy/sender";
import { getMandatoryOptions } from "./utils";

import type { BatchItem, OnProgress, SendOptions, SendResult } from "@rpldy/shared";
import type { ChunkedOptions, MandatoryChunkedOptions } from "./types";

type Chunk = {
	id: string,
	size: number,
	attempt: number,
};


const getChunks = (item: BatchItem, options: MandatoryChunkedOptions): Chunk[] => {


};

const sendWithChunks = (
	item: BatchItem,
	chunkedOptions: MandatoryChunkedOptions,
	url: string,
	sendOptions: SendOptions,
	onProgress: OnProgress
): SendResult => {

	const chunks = getChunks(item, chunkedOptions);

	const abort = () =>  {

		//TODO: abort all pending/in-progress chunk requests

	};



};

export default (chunkedOptions: ?ChunkedOptions) => {
	chunkedOptions = getMandatoryOptions(chunkedOptions);

	return (items: BatchItem[], url: string, sendOptions: SendOptions, onProgress: OnProgress): SendResult => {
		let result;

		if (items.length > 1 || items[0].url) {
			logger.debugLog(`ChunkedUploady.sender: sending items as normal, un-chunked requests`);
			result = send(items, url, sendOptions, onProgress);
		} else {
			logger.debugLog(`ChunkedUploady.sender: sending file as a chunked request`);
			result = sendWithChunks(items[0], chunkedOptions, url, sendOptions, onProgress);
		}

		return result;
	};
};