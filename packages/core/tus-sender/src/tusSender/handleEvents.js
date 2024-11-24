// @flow
import { FILE_STATES, logger } from "@rpldy/shared";
import { UPLOADER_EVENTS } from "@rpldy/uploader";
import { CHUNKING_SUPPORT, CHUNK_EVENTS, } from "@rpldy/chunked-sender";
import { removeResumable } from "../resumableStore";
import initTusUpload from "./initTusUpload";
import { PART_UPLOAD_STATES, SUCCESS_CODES } from "../consts";

import type { UploadData } from "@rpldy/shared";
import type { TriggerMethod } from "@rpldy/life-events";
import type {
    ChunkedSender,
    ChunkStartEventData,
    ChunkFinishEventData, ChunkEventData
} from "@rpldy/chunked-sender";
import type { UploaderCreateOptions, UploaderType } from "@rpldy/uploader";
import type { TusState, State  } from "../types";
import type {  ParallelPartData, ItemInfo } from "./types";

const PATCH = "PATCH";

const getHeadersWithoutContentRange = (headers: ?Object) => ({
    ...headers,
    //TUS doesn't expect content-range header and may not whitelist for CORS
    "Content-Range": undefined,
});

const getParallelChunkInfoFromStore = (tusState: TusState, orgItemId: string) => {
    const { parallelParts } = tusState.getState().items[orgItemId];

    const chunkDataIdx = parallelParts?.findIndex((cd) => cd.state !== PART_UPLOAD_STATES.UPLOADING);

    if (!~chunkDataIdx) {
        throw new Error(`tusSender: no IDLE parallel chunk found for item: ${orgItemId}`);
    }

    tusState.updateState((state: State) => {
        //mark part's upload URL as "locked" so it can't be used by another chunk until this upload finishes
        if (state.items[orgItemId].parallelParts) {
            state.items[orgItemId].parallelParts[chunkDataIdx].state = PART_UPLOAD_STATES.UPLOADING;
        }
    });

    const parallelData: ParallelPartData = parallelParts?.[chunkDataIdx];

    return {
        partIndex: chunkDataIdx,
        parallelUrl: parallelData.uploadUrl,
        parallelId: parallelData.identifier,
    };
};

const getParallelChunkIdentifier = (tusState: TusState, orgItemId: string, chunkId: string) => {
    const { parallelParts } = tusState.getState().items[orgItemId];

    const parallelData: ?ParallelPartData = parallelParts.find((cd) => cd.chunkIds.includes(chunkId));

    if (!parallelData) {
        throw new Error(`tusSender: no parallel chunk found for item: ${orgItemId} and chunk: ${chunkId}`);
    }

    return parallelData.identifier;
};

const handleParallelChunk = (tusState: TusState, chunkedSender: ChunkedSender, data: ChunkStartEventData, trigger: TriggerMethod): Promise<boolean> => {
	const { item: orgItem, chunkItem, url, sendOptions, onProgress, chunk } = data;
    const { partIndex, parallelUrl, parallelId } = getParallelChunkInfoFromStore(tusState, orgItem.id);

    tusState.updateState((state: State) => {
        state.items[orgItem.id].parallelParts?.[partIndex].chunkIds.push(chunk.id);
    });

    const initResult = initTusUpload(
        [chunkItem],
        parallelUrl || url,
        {
            ...sendOptions,
            headers: getHeadersWithoutContentRange(sendOptions.headers),
            //params will be sent as metadata with the finalizing request
            params: null,
        },
        onProgress,
        tusState,
        chunkedSender,
        trigger,
        parallelId,
        orgItem.id,
    );

    return initResult.request
        .then((response: UploadData) => {
            return response.state !== FILE_STATES.FINISHED;
        });
};

const getParallelChunkUploadData = (tusState: TusState, orgItemId: string, chunkId: string) => {
    const parallelId = getParallelChunkIdentifier(tusState, orgItemId, chunkId);
    const ppData = tusState.getState().items[orgItemId]
        .parallelParts?.find((cd: ParallelPartData) => cd.identifier === parallelId);

    return {
        offset: ppData?.lastOffset || 0,
        uploadUrl: ppData?.uploadUrl,
    };
};

const getNormalChunkUploadData = (tusState: TusState, orgItemId: string, chunk: ChunkEventData) => {
    const orgItemInfo = tusState.getState().items[orgItemId];
    return {
        offset: orgItemInfo.offset || chunk.start,
        uploadUrl: orgItemInfo.uploadUrl,
    };
};

//here we modify the request info that chunk-sender will use to send the chunk
const updateChunkStartData = (tusState: TusState, data: ChunkStartEventData, isParallel: boolean) => {
	const { item: orgItem, chunk, remainingCount } = data;
	const { options } = tusState.getState();
    const { offset, uploadUrl } = isParallel ?
        getParallelChunkUploadData(tusState, orgItem.id, chunk.id) :
        getNormalChunkUploadData(tusState, orgItem.id, chunk);

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
		url: uploadUrl
	});

	return {
		sendOptions: {
			sendWithFormData: false,
			method: options.overrideMethod ? "POST" : PATCH,
			headers,
		},
		url: uploadUrl, //itemInfo.uploadUrl,
	};
};

const handleEvents = (uploader: UploaderType<UploaderCreateOptions>, tusState: TusState, chunkedSender: ChunkedSender, trigger: TriggerMethod) => {
    if (CHUNKING_SUPPORT) {
        uploader.on(UPLOADER_EVENTS.ITEM_FINALIZE, (item) => {
            const { items, options } = tusState.getState(),
                itemData: ItemInfo = items[item.id];

            if (itemData) {
                logger.debugLog(`tusSender.handleEvents: item ${item.id} finalized (${item.state}). Removing from state`);
                const { parallelParts } = itemData;

                tusState.updateState((state: State) => {
                    //remove all items stored for parallel chunks
                    if (parallelParts?.length) {
                        parallelParts.forEach((pcData: ParallelPartData) => {
                            pcData.chunkIds.forEach((chunkId) => {
                                delete state.items[chunkId];
                            });
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
                handleParallelChunk(tusState, chunkedSender, data, trigger) :
                Promise.resolve(true);

            return continueP.then(
                (continueHandle: boolean) =>
                    continueHandle && updateChunkStartData(tusState, data, isParallel)
            );
        });

        uploader.on(CHUNK_EVENTS.CHUNK_FINISH, ({ item, chunk, uploadData }: ChunkFinishEventData) => {
            const { items, options } = tusState.getState(),
                isParallel = +options.parallel > 1;

            // if (isParallel) {
                // if (options.forgetOnSuccess) {
                //     const parallelId = getParallelChunkIdentifier(tusState, item.id, chunk.id);
                //     logger.debugLog(`tusSender.handleEvents: forgetOnSuccess enabled, removing parallel chunk url from storage: ${parallelId}`);
                //     removeResumable(item, options, parallelId);
                // }
                //update offset for parallel chunk
            // }
            if (items[item.id]) {
                const { status, response } = uploadData;
                logger.debugLog(`tusSender.handleEvents: received upload response (code: ${status}) for : ${item.id}, chunk: ${chunk.id}`, response);

                if (~SUCCESS_CODES.indexOf(status) && response.headers) {
                    const parallelId = isParallel && getParallelChunkIdentifier(tusState, item.id, chunk.id);

                    tusState.updateState((state: State) => {
                        if (parallelId) {
                            //update state's offset for the parallel part:
                            const ppPart = state.items[item.id].parallelParts?.find((pd: ParallelPartData) => pd.identifier === parallelId);
                            if (ppPart) {
                                ppPart.lastOffset = parseInt(response.headers["upload-offset"]);
                                ppPart.state = PART_UPLOAD_STATES.IDLE;
                            }
                        } else {
                            //update state's offset for non-parallel chunks
                            const data = state.items[item.id];
                            data.offset = parseInt(response.headers["upload-offset"]);
                        }
                    });
                }
            }
        });
    }
};

export default handleEvents;
