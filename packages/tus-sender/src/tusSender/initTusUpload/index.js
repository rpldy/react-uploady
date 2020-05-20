// @flow
import { logger } from "@rpldy/shared";
import { retrieveResumable } from "../resumableStore";
import createUpload from "./createUpload";
import resumeUpload from "./resumeUpload";
import handleTusUpload from "../handleTusUpload";

import type { BatchItem } from "@rpldy/shared";
import type { SendOptions } from "@rpldy/sender";
import type { ChunkedSender, OnProgress } from "@rpldy/chunked-sender";
import type { TusState } from "../types";

export default (items: BatchItem[],
				url: string,
				sendOptions: SendOptions,
				onProgress: OnProgress,
				tusState: TusState,
				chunkedSender: ChunkedSender,
) => {
	const item = items[0];
	const persistedUrl = retrieveResumable(item, tusState.getState().options);

	const { request: initRequest, abort: abortInit } = persistedUrl ?
		//init resumable upload - this file has already started uploading
		resumeUpload(item, persistedUrl, tusState) :
		//init new upload - first time uploading this file
		createUpload(item, url, tusState, sendOptions);

	const uploadRequest = handleTusUpload(
		items,
		url,
		sendOptions,
		onProgress,
		tusState,
		chunkedSender,
		initRequest,
		!!persistedUrl,
	);

	const abort = () => {
		logger.debugLog(`tusSender.handler: abort called for item: ${item.id}`);
		//attempt to abort create/resume call if its still running
		abortInit();

		initRequest
			.then((data) => {
				if (data) {
					logger.debugLog(`tusSender.handler: aborting chunked upload for item:  ${item.id}`);

					const abortChunked = tusState.getState().items[item.id].abort;

					if (abortChunked) {
						abortChunked();
					}
				}
			});

		return true;
	};

	return {
		request: uploadRequest,
		abort,
	};
};