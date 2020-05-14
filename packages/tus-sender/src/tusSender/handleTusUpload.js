// @flow
import { logger } from "@rpldy/shared";
import createUpload from "./createUpload";

import type { SendOptions } from "@rpldy/sender";
import type { BatchItem, UploadData } from "@rpldy/shared";
import type { ChunkedSender, OnProgress } from "@rpldy/chunked-sender";
import type { State, TusState } from "./types";

//TODO - resume if options.resume and fingerprint match
//TODO - need to handle relative link in resume/parallel
//TODO: if has feature detection results - check if parallel ext supported by server - if not - disable options.parallel
//TODO - need to cleanup - use item finish (abort/cancel?) to know if can be removed !

export default (items: BatchItem[],
                url: string,
                sendOptions: SendOptions,
                onProgress: OnProgress,
                tusState: TusState,
                chunkedSender: ChunkedSender,
) => {
    //allow ref to chunkedSend abort to be set async
    let abortChunked;
    const item = items[0];

    const { createRequest, abortCreate } = createUpload(item, url, tusState, sendOptions);

    const uploadRequest = new Promise((resolve, reject) => {
        createRequest.then((created) => {
            logger.debugLog(`tusSender.handler: create request finished. sending item ${item.id} as chunked`, created);

            if (created) {
                const chunkedResult = chunkedSender.send(items, url, sendOptions, onProgress);

                abortChunked = chunkedResult.abort;

                chunkedResult.request
                    .catch(reject)
                    .then(resolve);
            }
        });
    });

    const abort = () => {
        logger.debugLog(`tusSender.handler: abort called for item: ${item.id}`);
        abortCreate();

        createRequest
            .then((created) => {
                if (created && abortChunked) {
                    logger.debugLog(`tusSender.handler: aborting chunked upload for item:  ${item.id}`);
                    abortChunked();
                }
            });

        return true;
    };

    return {
        request: uploadRequest,
        abort,
    };
};

