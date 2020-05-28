// @flow
import { request, logger, FILE_STATES } from "@rpldy/shared";
import { getUploadMetadata } from "./utils";
import { SUCCESS_CODES } from "../consts";

import type { BatchItem, UploadData } from "@rpldy/shared";
import type { SendOptions } from "@rpldy/sender";
import type { TusState } from "../types";

export default async (
	item: BatchItem,
	url: string,
	tusState: TusState,
	sendOptions: SendOptions,
	chunkedRequest: Promise<UploadData>,
) => {
	let result: UploadData = await chunkedRequest;

	if (result.state === FILE_STATES.FINISHED) {
		const { options, items } = tusState.getState(),
			itemData = items[item.id];

		if (itemData) {
			const chunkItemIds = itemData.parallelChunks;
			const parallelUploadUrls = chunkItemIds
				.filter((chunkId: string) => items[chunkId]?.uploadUrl)
				.map((chunkId: string) => items[chunkId].uploadUrl);

			if (parallelUploadUrls.length !== chunkItemIds.length) {
				throw new Error(`tusSender: something went wrong. found only ${parallelUploadUrls.length} upload urls for ${chunkItemIds.length} chunks`);
			}

			const headers = {
				"tus-resumable": options.version,
				"Upload-Concat": `final;${parallelUploadUrls.join(" ")}`,
				"Upload-Metadata": getUploadMetadata(sendOptions),
			};

			logger.debugLog(`tusSender.finalizeParallel: sending finalizing request`, {
				url,
				headers
			});

			const pXhr = request(url, null, { method: "POST", headers });

			tusState.updateState((state) => {
				state.items[item.id].abort = () => {
					//override the state item's abort with the finalize request abort
					// $FlowFixMe
					pXhr.xhr.abort();
					return true;
				};
			});

			let finalizeResponse;

			try {
				finalizeResponse = await pXhr;
			} catch (ex) {
				logger.debugLog(`tusSender.finalizeParallel: finalize request failed unexpectedly!`, ex);
				finalizeResponse = { status: 0, response: (ex.message || ex) };
			}

			const successCode = finalizeResponse &&
				!!~SUCCESS_CODES.indexOf(finalizeResponse.status);

			const resLocation = successCode &&
				finalizeResponse.getResponseHeader &&
				finalizeResponse.getResponseHeader("Location");

			if (resLocation) {
				logger.debugLog(`tusSender.finalizeParallel: successfully finalized parallel upload`, resLocation);
			} else {
				logger.debugLog(`tusSender.finalizeParallel: parallel upload finalize failed!`, finalizeResponse.status);

				result = {
					status: finalizeResponse.status,
					state: FILE_STATES.ERROR,
					response: finalizeResponse.response || (successCode && !resLocation ? "No valid location header for finalize request" : ""),
				};
			}
		}
	}

	return result;
};