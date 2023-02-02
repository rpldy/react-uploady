// @flow
import { logger } from "@rpldy/shared";
import { CHUNKING_SUPPORT } from "@rpldy/chunked-sender";
import xhrSend, { MissingUrlError, type SendMethod, type SendOptions } from "@rpldy/sender";
import initTusUpload from "./initTusUpload";
import { TUS_SENDER_TYPE } from "../consts";
import doFeatureDetection from "../featureDetection";

import type { BatchItem } from "@rpldy/shared";
import type { TriggerMethod } from "@rpldy/life-events";
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
	fdRequest,
    trigger,
) => {
	let tusAbort;

	const callInit = () => {
		const tusResult = initTusUpload(items, url, sendOptions, onProgress, tusState, chunkedSender, trigger);
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

const tusSend = (
    chunkedSender: ChunkedSender,
    tusState: TusState,
    trigger: TriggerMethod
): SendMethod<ChunkedSendOptions> | SendMethod<SendOptions> => {
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
                fdRequest,
                trigger
            );

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

export default tusSend;
