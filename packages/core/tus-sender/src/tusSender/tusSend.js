// @flow
import { logger } from "@rpldy/shared";
import { CHUNKING_SUPPORT, createChunkedSender } from "@rpldy/chunked-sender";
import xhrSend, { MissingUrlError, type SendMethod, type SendOptions } from "@rpldy/sender";
import { TUS_SENDER_TYPE } from "../consts";
import doFeatureDetection from "../featureDetection";
import { initTusUpload, initParallelTusUpload } from "./initTusUpload";
import handleEvents from "./handleEvents";

import type { BatchItem } from "@rpldy/shared";
import type { TriggerMethod } from "@rpldy/life-events";
import type {
	ChunkedSender,
	OnProgress,
	ChunkedSendOptions,
	SendResult,
} from "@rpldy/chunked-sender";
import type { UploaderCreateOptions, UploaderType } from "@rpldy/uploader";
import type { RequestResult, TusState } from "../types";

const getChunkedSender = (tusState: TusState, trigger: TriggerMethod): ChunkedSender =>
    createChunkedSender(tusState.getState().options, trigger);

const doUpload = (
	items: BatchItem[],
	url: string,
	sendOptions: ChunkedSendOptions,
	onProgress: OnProgress,
	tusState: TusState,
	fdRequest: ?RequestResult<void>,
    trigger: TriggerMethod,
) => {
	let tusAbort;

	const callInit = () => {
        const parallel = +tusState.getState().options.parallel;
        const isParallel =  parallel > 1;

        logger.debugLog(`tusSender: about to initialize ${isParallel ? `parallel (${parallel})` : "single"} part upload`);

        const tusResult = isParallel ?
            initParallelTusUpload(items, url, sendOptions, onProgress, tusState, trigger) :
            initTusUpload(items, url, sendOptions, onProgress, tusState, getChunkedSender(tusState, trigger), trigger);

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

const getTusSend = (
    uploader: UploaderType<UploaderCreateOptions>,
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
            result = getChunkedSender(tusState, trigger).send(items, url, sendOptions, onProgress);
        } else {
            handleEvents(uploader, tusState, trigger);

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

export default getTusSend;
