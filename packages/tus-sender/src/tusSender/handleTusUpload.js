// @flow
import { FILE_STATES, logger } from "@rpldy/shared";
import createUpload from "./initTusUpload/createUpload";
import { persistResumable } from "./resumableStore";
import finalizeParallelUpload from "./finalizeParallelUpload";

import type { SendOptions } from "@rpldy/sender";
import type { BatchItem } from "@rpldy/shared";
import type { ChunkedSender, OnProgress } from "@rpldy/chunked-sender";
import type { TusState } from "../types";
import type { InitData } from "./types";

const doChunkedUploadForItem = (
	items: BatchItem[],
	url: string,
	sendOptions: SendOptions,
	onProgress: OnProgress,
	tusState: TusState,
	chunkedSender: ChunkedSender,
	initData: InitData,
) => {
	const { options } = tusState.getState();
	const item = items[0];
	logger.debugLog(`tusSender.handler: init request finished. sending item ${item.id} as chunked`, initData);

	if (initData.isNew && initData.uploadUrl) {
		persistResumable(item, initData.uploadUrl, options);
	}

	if (initData.canResume || (options.sendDataOnCreate && initData.offset)) {
		sendOptions = {
			...sendOptions,
			startByte: initData.offset,
		};
	}

	//upload the file using the chunked-sender
	const chunkedResult = chunkedSender.send(items, url, sendOptions, onProgress);

	tusState.updateState((state) => {
		//keep the abort from chunked sender
		state.items[item.id].abort = chunkedResult.abort;
	});

	return +options.parallel > 1 ?
		//parallel requires a finalizing request
		finalizeParallelUpload(item, url, tusState, sendOptions, chunkedResult.request) :
		chunkedResult.request;
};

const handleParallelizedChunkInit = (items: BatchItem[], tusState: TusState, initData: InitData, parallelIdentifier: string) => {
	const item = items[0];

	if (initData.uploadUrl) {
		persistResumable(item, initData.uploadUrl, tusState.getState().options, parallelIdentifier);
	}

	logger.debugLog(`tusSender.handler: created upload for parallelized chunk: ${item.id}`);

	return Promise.resolve({
		status: 200,
		state: FILE_STATES.UPLOADING,
		response: "TUS server created upload for parallelized part",
	});
};

const handleTusUpload = async (
	items: BatchItem[],
	url: string,
	sendOptions: SendOptions,
	onProgress: OnProgress,
	tusState: TusState,
	chunkedSender: ChunkedSender,
	initRequest: Promise<?InitData>,
	isResume?: boolean,
	parallelIdentifier: ?string,
) => {
	const initData: ?InitData = await initRequest;

	let request,
		resumeFailed = false;

	if (initData) {
		if (initData.isDone) {
			logger.debugLog(`tusSender.handler: resume found server has completed file for item: ${items[0].id}`, items[0]);
			request = Promise.resolve({
				status: 200,
				state: FILE_STATES.FINISHED,
				response: "TUS server has file",
			});
		} else if (!initData.isNew && !initData.canResume) {
			resumeFailed = true;
		} else if (parallelIdentifier) {
			//no need for another chunked upload - we're already inside a parallel chunk upload flow (initiated by chunk start handler - handleEvents)
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
		//currently, this second init request (after failed resume) cannot be aborted
		request = await handleTusUpload(items, url, sendOptions, onProgress, tusState, chunkedSender, createRequest);
	}

	return request || Promise.resolve({
		status: 0,
		state: FILE_STATES.ERROR,
		response: "TUS initialize failed",
	});
};

export default handleTusUpload;

