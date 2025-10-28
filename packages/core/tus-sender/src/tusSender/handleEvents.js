// @flow
import { logger, triggerUpdater, getMerge, merge, isPlainObject } from "@rpldy/shared";
import { UPLOADER_EVENTS } from "@rpldy/uploader";
import { CHUNKING_SUPPORT, CHUNK_EVENTS, } from "@rpldy/chunked-sender";
import { removeResumable } from "../resumableStore";
import { SUCCESS_CODES, TUS_EVENTS } from "../consts";
import { getHeadersWithoutContentRange } from "./utils";

import type { BatchItem } from "@rpldy/shared";
import type { TriggerMethod } from "@rpldy/life-events";
import type { UploaderCreateOptions, UploaderType } from "@rpldy/uploader";
import type {
    ChunkStartEventData,
    ChunkFinishEventData,
    ChunkEventData,
} from "@rpldy/chunked-sender";
import type { TusState, State, TusOptions } from "../types";
import type { ItemInfo, PartStartEventData, PartStartResponseData } from "./types";

const mergeWithUndefined = getMerge({ undefinedOverwrites: true });

const PATCH = "PATCH";

const getChunkUploadData = (tusState: TusState, orgItemId: string, chunk: ChunkEventData) => {
    const orgItemInfo = tusState.getState().items[orgItemId];

    return {
        offset: orgItemInfo.offset || chunk.start,
        uploadUrl: orgItemInfo.uploadUrl,
    };
};

const forgetPersistedUrls = (item: BatchItem, itemInfo: ItemInfo, options: TusOptions) => {
    logger.debugLog(`tusSender.handleEvents: forgetOnSuccess enabled, removing item url from storage: ${item.id}`);
    removeResumable(item, options);

    itemInfo.parallelParts?.forEach((pp) => {
        removeResumable(pp.item, options, pp.identifier);
    });
};

const getPartUpdatedRequest = (data: ChunkStartEventData, trigger: TriggerMethod) =>
    triggerUpdater<PartStartEventData>(trigger, TUS_EVENTS.PART_START, {
        url: data.url,
        item: data.item,
        headers: data.sendOptions?.headers || {},
        chunk: data.chunk,
    })
        // $FlowFixMe - https://github.com/facebook/flow/issues/8215
        .then((response: PartStartResponseData) => {
            let updated = data;

            if (response && isPlainObject(response)) {
                const { headers: respHeaders, url: respUrl } = response;

                updated = merge({}, data, {
                    sendOptions: {
                        headers: respHeaders,
                    },
                    url: respUrl,
                });
            }

            return updated;
        });

const handleEvents = (uploader: UploaderType<UploaderCreateOptions>, tusState: TusState, trigger: TriggerMethod) => {
    if (CHUNKING_SUPPORT) {
        uploader.on(UPLOADER_EVENTS.ITEM_FINALIZE, (item) => {
            const { items, options } = tusState.getState(),
                itemInfo: ItemInfo = items[item.id];

            if (itemInfo) {
                logger.debugLog(`tusSender.handleEvents: item ${item.id} finalized (${item.state}). Removing from state`);

                tusState.updateState((state: State) => {
                    delete state.items[item.id];
                });

                if (options.forgetOnSuccess) {
                    forgetPersistedUrls(item, itemInfo, options);
                }

                tusState.updateState((state) => {
                    itemInfo.parallelParts?.forEach((pp) => {
                        delete state.items[pp.item.id];
                    });
                });
            }
        });



        uploader.on(CHUNK_EVENTS.CHUNK_START, (data: ChunkStartEventData) => {
            const { item, chunk, remainingCount } = data;
            const { options, items } = tusState.getState();
            const { offset, uploadUrl } = getChunkUploadData(tusState, item.id, chunk);

            const parallelId = items[item.id].parallelIdentifier;

            const headers = getHeadersWithoutContentRange({
                "tus-resumable": options.version,
                "Upload-Offset": offset,
                "Content-Type": "application/offset+octet-stream",
                "X-HTTP-Method-Override": options.overrideMethod ? PATCH : undefined,
                //for deferred length, send the file size header with the last chunk
                "Upload-Length": (options.deferLength && !remainingCount) ? item.file.size : undefined,
                "Upload-Concat": parallelId ? "partial" : undefined,
            });

            logger.debugLog(`tusSender.handleEvents: chunk ${chunk.id}[${chunk.index}] start handler. offset = ${offset}`, {
                headers,
                url: uploadUrl
            });

            //merge the updated headers and url into the chunk upload data for this part so can be handed to user-land PART_START handlers
            const chunkDataOverrides = mergeWithUndefined({}, data, {
                sendOptions: {
                    sendWithFormData: false,
                    method: options.overrideMethod ? "POST" : PATCH,
                    headers,
                },
                url: uploadUrl,
            });

            return getPartUpdatedRequest(chunkDataOverrides,  trigger);
        });

        uploader.on(CHUNK_EVENTS.CHUNK_FINISH, ({ item, chunk, uploadData }: ChunkFinishEventData) => {
            const { items } = tusState.getState();

            if (items[item.id]) {
                const { status, response } = uploadData;
                logger.debugLog(`tusSender.handleEvents: upload response (code: ${status}) for item: ${item.id}, chunk: ${chunk.id}`, response);

                if (~SUCCESS_CODES.indexOf(status) && response.headers) {
                    tusState.updateState((state: State) => {
                        //update state's offset for non-parallel chunks
                        const data = state.items[item.id];
                        data.offset = parseInt(response.headers["upload-offset"]);
                    });
                }
            }
        });
    }
};

export default handleEvents;
