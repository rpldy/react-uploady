// @flow
import { logger } from "@rpldy/shared";
import { CHUNKING_SUPPORT, CHUNK_EVENTS, } from "@rpldy/chunked-sender";
import { SUCCESS_CODES } from "./consts";

import type { ChunkedSender, ChunkStartEventData, ChunkFinishEventData } from "@rpldy/chunked-sender";
import type { TusState } from "./types";

const PATCH = "PATCH";

export default (tusState: TusState, chunkedSender: ChunkedSender) => {

    // uploader.on(UPLOADER_EVENTS.ITEM_START, (item) => {
    //     if (!~state.items.indexOf(item.id)) {
    //         update((state) => {
    //             state.items.push(item.id);
    //         });
    //     }
    // });
    //
    // uploader.on(UPLOADER_EVENTS.ITEM_FINISH, (item) => {
    //     const index = state.items.indexOf(item.id);
    //
    //     if (~index) {
    //         update((state) => {
    //             state.items.splice(index);
    //         });
    //     }
    //
    //     //TODO: make sure finish is called even on error/cancel/abort
    // });

    if (CHUNKING_SUPPORT) {
        chunkedSender.on(CHUNK_EVENTS.CHUNK_START, ({ item, chunk }: ChunkStartEventData) => {

            //TODO: add relevant headers when tusState.getState().options.parallel > 1
            //"Upload-Concat": "partial"

            const { items, options } = tusState.getState(),
                itemInfo = items[item.id],
                // url = itemInfo.uploadUrl,
                headers = {
                    "tus-resumable": options.version,
                    "Upload-Offset": itemInfo.offset, //chunk.start,
                    "Content-Type": "application/offset+octet-stream",
                    "Content-Range": undefined,
                };

            if (options.overrideMethod) {
                headers["X-HTTP-Method-Override"] = PATCH;
            }

            logger.debugLog(`tusSender.handleEvents: chunk start handler - chunk start = ${chunk.start}, tus offset = ${itemInfo.offset}`);

            return {
                sendOptions: {
                    sendWithFormData: false,
                    method: options.overrideMethod ? "POST" : PATCH,
                    headers,
                },
                url: itemInfo.uploadUrl,
            };
        });

        chunkedSender.on(CHUNK_EVENTS.CHUNK_FINISH, ({ item, chunk, uploadData }: ChunkFinishEventData) => {
            const { status, response } = uploadData;
            logger.debugLog(`tusSender.handleEvents: received upload response (code: ${status}) for : ${item.id}`, response);

            if (~SUCCESS_CODES.indexOf(status) && response.headers) {
                tusState.updateState((state: State) => {
                    const data = state.items[item.id];
                    data.offset = response.headers["upload-offset"];
                });
            }
        });
    }
};
