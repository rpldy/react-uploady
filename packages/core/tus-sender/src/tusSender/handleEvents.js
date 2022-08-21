// @flow
import { FILE_STATES, logger } from "@rpldy/shared";
import { UPLOADER_EVENTS } from "@rpldy/uploader";
import { CHUNKING_SUPPORT, CHUNK_EVENTS, } from "@rpldy/chunked-sender";
import { removeResumable } from "../resumableStore";
import initTusUpload from "./initTusUpload";
import { SUCCESS_CODES } from "../consts";

import type { UploadData } from "@rpldy/shared";
import type {
	ChunkedSender,
	ChunkStartEventData,
	ChunkFinishEventData
} from "@rpldy/chunked-sender";
import type { UploaderCreateOptions, UploaderType } from "@rpldy/uploader";
import type { TusOptions, TusState, State } from "../types";

const PATCH = "PATCH";

const getParallelChunkIdentifier = (options: TusOptions, chunkIndex: number) =>
	`_prlChunk_${+options.chunkSize}_${chunkIndex}`;

const getHeadersWithoutContentRange = (headers) => ({
    ...headers,
    //TUS doesnt expect content-range header and may not whitelist for CORS
    "Content-Range": undefined,
});

const handleParallelChunk = (tusState: TusState, chunkedSender: ChunkedSender, data: ChunkStartEventData): Promise<boolean> => {
	const { item: orgItem, chunkItem, url, sendOptions, onProgress, chunk } = data;
	const { options } = tusState.getState();

	tusState.updateState((state) => {
		//store the parallel upload URLs under the original batch item data
		state.items[orgItem.id].parallelChunks.push(chunkItem.id);
	});

	const initResult = initTusUpload(
		[chunkItem],
		url,
		{
			...sendOptions,
            headers: getHeadersWithoutContentRange(sendOptions.headers),
			//params will be sent as metadata with the finalizing request
			params: null,
		},
		onProgress,
		tusState,
		chunkedSender,
		getParallelChunkIdentifier(options, chunk.index),
	);

    return initResult.request
        .then((response: UploadData) => {
            return response.state !== FILE_STATES.FINISHED;
        });
};

const updateChunkStartData = (tusState: TusState, data: ChunkStartEventData, isParallel) => {
	const { item: orgItem, chunk, chunkItem, remainingCount } = data;
	const { options } = tusState.getState();
	const itemInfo = tusState.getState().items[isParallel ? chunkItem.id : orgItem.id];
	const offset = isParallel ? 0 : (itemInfo.offset || chunk.start);

	const headers = getHeadersWithoutContentRange({
        "tus-resumable": options.version,
        "Upload-Offset": offset,
        "Content-Type": "application/offset+octet-stream",
        "X-HTTP-Method-Override": options.overrideMethod ? PATCH : undefined,
        //for deferred length, send the file size header with the last chunk
        "Upload-Length": (options.deferLength && !remainingCount) ? orgItem.file.size : undefined,
        "Upload-Concat": isParallel ? "partial" : undefined,
    });

	logger.debugLog(`tusSender.handleEvents: chunk start handler. offset = ${offset}`, {
		headers,
		url: itemInfo.uploadUrl
	});

	return {
		sendOptions: {
			sendWithFormData: false,
			method: options.overrideMethod ? "POST" : PATCH,
			headers,
		},
		url: itemInfo.uploadUrl,
	};
};

const handleEvents = (uploader: UploaderType<UploaderCreateOptions>, tusState: TusState, chunkedSender: ChunkedSender) => {
    if (CHUNKING_SUPPORT) {
        uploader.on(UPLOADER_EVENTS.ITEM_FINALIZE, (item) => {
            const { items, options } = tusState.getState(),
                itemData = items[item.id];

            if (itemData) {
                logger.debugLog(`tusSender.handleEvents: item ${item.id} finalized (${item.state}). Removing from state`);

                const parallelChunks = itemData.parallelChunks;

                tusState.updateState((state: State) => {
                    if (parallelChunks.length) {
                        parallelChunks.forEach((chunkItemId) => {
                            delete state.items[chunkItemId];
                        });
                    }

                    delete state.items[item.id];
                });

                if (options.forgetOnSuccess) {
                    logger.debugLog(`tusSender.handleEvents: forgetOnSuccess enabled, removing item url from storage: ${item.id}`);
                    removeResumable(item, options);
                }
            }
        });

        uploader.on(CHUNK_EVENTS.CHUNK_START, (data: ChunkStartEventData) => {
            const { options } = tusState.getState(),
                isParallel = +options.parallel > 1;

            const continueP = isParallel ?
                handleParallelChunk(tusState, chunkedSender, data) :
                Promise.resolve(true);

            return continueP.then((continueHandle: boolean) => continueHandle &&
                updateChunkStartData(tusState, data, isParallel)
            );
        });

        uploader.on(CHUNK_EVENTS.CHUNK_FINISH, ({ item, chunk, uploadData }: ChunkFinishEventData) => {
            const { items, options } = tusState.getState(),
                isParallel = +options.parallel > 1;

            if (isParallel) {
                if (options.forgetOnSuccess) {
                    const parallelId = getParallelChunkIdentifier(options, chunk.index);
                    logger.debugLog(`tusSender.handleEvents: forgetOnSuccess enabled, removing parallel chunk url from storage: ${parallelId}`);
                    removeResumable(item, options, parallelId);
                }
            } else if (items[item.id]) {
                const { status, response } = uploadData;
                logger.debugLog(`tusSender.handleEvents: received upload response (code: ${status}) for : ${item.id}, chunk: ${chunk.id}`, response);

                if (~SUCCESS_CODES.indexOf(status) && response.headers) {
                    //update state's offset for non-parallel chunks
                    tusState.updateState((state: State) => {
                        const data = state.items[item.id];
                        data.offset = response.headers["upload-offset"];
                    });
                }
            }
        });
    }
};

export default handleEvents;
