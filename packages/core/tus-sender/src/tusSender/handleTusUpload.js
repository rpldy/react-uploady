// @flow
import { FILE_STATES, logger } from "@rpldy/shared";
import { persistResumable } from "../resumableStore";
import createUpload from "./initTusUpload/createUpload";
import finalizeParallelUpload from "./finalizeParallelUpload";
import { addLocationToResponse } from "./utils";

import type { BatchItem, UploadData } from "@rpldy/shared";
import type { ChunkedSender, ChunkedSendOptions, OnProgress } from "@rpldy/chunked-sender";
import type { State, TusState } from "../types";
import type { InitData } from "./types";
import { PART_UPLOAD_STATES as PARALLEL_CHUNK_STATES } from "../consts";

const doChunkedUploadForItem = (
	items: BatchItem[],
	url: string,
	sendOptions: ChunkedSendOptions,
	onProgress: OnProgress,
	tusState: TusState,
	chunkedSender: ChunkedSender,
	initData: InitData,
) => {
	const { options } = tusState.getState();
	const item = items[0];
	logger.debugLog(`tusSender.handler: init request finished. sending item ${item.id} as chunked`, initData);

    let usedSendOptions = sendOptions;

	if (initData.isNew && initData.uploadUrl) {
		persistResumable(item, initData.uploadUrl, options);
	}

	if (initData.canResume || (options.sendDataOnCreate && initData.offset)) {
		usedSendOptions = {
			...sendOptions,
			startByte: initData.offset,
		};
	}

	//upload the file using the chunked-sender
	const chunkedResult = chunkedSender.send(items, url, usedSendOptions, onProgress);

	tusState.updateState((state) => {
		//keep the abort from chunked sender
		state.items[item.id].abort = chunkedResult.abort;
	});

	return +options.parallel > 1 ?
		//parallel requires a finalizing request
		finalizeParallelUpload(item, url, tusState, usedSendOptions, chunkedResult.request) :
        addLocationToResponse(chunkedResult.request, initData.uploadUrl);
};

const handleParallelizedChunkInit = (items: BatchItem[], tusState: TusState, initData: InitData, parallelIdentifier: string) => {
	const item = items[0];

	if (initData.uploadUrl) {
		persistResumable(item, initData.uploadUrl, tusState.getState().options, parallelIdentifier);

        tusState.updateState((state: State) => {
            //get the parent item id for this parallel chunk
            const orgItemId = state.items[item.id].orgItemId;
            const ppData = orgItemId && state.items[orgItemId].parallelParts?.find((pd) => pd.identifier === parallelIdentifier);
            if (ppData) {
                ppData.uploadUrl = initData.uploadUrl;
                //got upload URL, mark data as IDLE for following chunks
                ppData.state = PARALLEL_CHUNK_STATES.IDLE;
            }
        });
    }

	logger.debugLog(`tusSender.handler: created upload for parallelized chunk: ${item.id}`);

	return Promise.resolve({
		status: 200,
		state: FILE_STATES.UPLOADING,
		response: "TUS server created upload for parallelized part",
	});
};

const handleTusUpload = (
	items: BatchItem[],
	url: string,
	sendOptions: ChunkedSendOptions,
	onProgress: OnProgress,
	tusState: TusState,
	chunkedSender: ChunkedSender,
	initRequest: Promise<?InitData>,
	isResume?: boolean,
    parallelIdentifier: ?string,
): Promise<UploadData> =>
    initRequest
        .then((initData: ?InitData) => {
            let request,
                resumeFailed: ?boolean = false;

            if (initData) {
                if (initData.isDone) {
                    logger.debugLog(`tusSender.handler: resume found server has completed file for item: ${items[0].id}`, items[0]);
                    request = addLocationToResponse(Promise.resolve({
                        status: 200,
                        state: FILE_STATES.FINISHED,
                        response: { message: "TUS server has file" },
                    }), initData.uploadUrl);
                } else if (!initData.isNew && !initData.canResume) {
                    resumeFailed = true;
                } else if (parallelIdentifier) {
                    //no need for another chunked upload - already inside a parallel chunk upload flow (initiated by chunk start handler - handleEvents)
                    request = handleParallelizedChunkInit(items, tusState, initData, parallelIdentifier);
                } else {
                    request = doChunkedUploadForItem(items, url, sendOptions, onProgress, tusState, chunkedSender, initData);
                }
            } else {
                resumeFailed = isResume;
            }

            if (resumeFailed) {
                logger.debugLog(`tusSender.handler: resume init failed. Will try creating a new upload for item: ${items[0].id}`);
                const { request: createRequest } = createUpload(items[0], url, tusState, sendOptions);
                //this second init request (after failed resume) cannot be aborted
                request = handleTusUpload(items, url, sendOptions, onProgress, tusState, chunkedSender, createRequest);
            }

            return request || Promise.resolve({
                status: 0,
                state: FILE_STATES.ERROR,
                response: "TUS initialize failed",
            });
        });

export default handleTusUpload;

