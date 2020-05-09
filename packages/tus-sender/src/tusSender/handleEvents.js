// @flow

import { CHUNKING_SUPPORT, CHUNK_EVENTS, } from "@rpldy/chunked-sender";
import type { ChunkedSender, ChunkEventData, SendOptions } from "@rpldy/chunked-sender";
import type { TusState } from "./types";

type ChunkStartEventData = {
    chunk: ChunkEventData,
    sendOptions: SendOptions,
};

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
        chunkedSender.on(CHUNK_EVENTS.CHUNK_START, ({ chunk, sendOptions }: ChunkStartEventData) => {

            //TODO: add relevant headers when tusState.getState().options.parallel > 1
            // "Upload-Concat": "partial"

            return {
                //sendoptions - headers,
                //url
            };
        });

        chunkedSender.on(CHUNK_EVENTS.CHUNK_FINISH, (chunk: ChunkEventData) => {

        });
    }
};
