// @flow
import { logger } from "@rpldy/shared";
import { CHUNKING_SUPPORT } from "@rpldy/chunked-sender";
import xhrSend, { MissingUrlError } from "@rpldy/sender";
import initTusUpload from "./initTusUpload";
import { TUS_SENDER_TYPE } from "../consts";
import doFeatureDetection from "../featureDetection";

import type { BatchItem } from "@rpldy/shared";
import type {
	ChunkedSender,
	OnProgress,
	ChunkedSendOptions,
	SendResult,
} from "@rpldy/chunked-sender";
import type { TusState } from "../types";

const doUpload = (
	items,
	url,
	sendOptions,
	onProgress,
	tusState,
	chunkedSender,
	fdRequest
) => {
	let tusAbort;

	const callInit = () => {
		const tusResult = initTusUpload(items, url, sendOptions, onProgress, tusState, chunkedSender);
		tusAbort = tusResult.abort;
		return tusResult.request;
	};

	return {
		request: fdRequest ?
			fdRequest.request.then(callInit, callInit) : callInit(),

		abort: () => tusAbort ?
			tusAbort() :
			fdRequest?.abort() || false,
	};
};

export default (chunkedSender: ChunkedSender, tusState: TusState):
  | any
  | ((
    items: Array<BatchItem>,
    url: ?string,
    sendOptions: ChunkedSendOptions,
    onProgress: OnProgress
  ) => SendResult) => {
	const tusSend = (
		items: BatchItem[],
		url: ?string,
		sendOptions: ChunkedSendOptions,
		onProgress: OnProgress
	): SendResult => {
		let result;

		if (!url) {
		    throw new MissingUrlError(TUS_SENDER_TYPE);
        }

		if (items.length > 1 || items[0].url) {
			//ignore this upload - let the chunked sender handle it
			result = chunkedSender.send(items, url, sendOptions, onProgress);
		} else {
			//TUS only supports a single file upload (no grouping)
			logger.debugLog(`tusSender: sending file using TUS protocol`);

			let fdRequest = tusState.getState().options.featureDetection ?
				doFeatureDetection(url, tusState) :
				null;

			const { request, abort } = doUpload(
				items,
				url,
				sendOptions,
				onProgress,
				tusState,
				chunkedSender,
				fdRequest);

			result = {
				request,
				abort,
				senderType: TUS_SENDER_TYPE,
			};
		}

		return result;
	};

	return CHUNKING_SUPPORT ? tusSend : xhrSend;
};
