// @flow
import { logger } from "@rpldy/shared";
import createUpload from "./createUpload";
import resumeUpload from "./resumeUpload";
import { persistResumable, retrieveResumable } from "./resumableStore";

import type { SendOptions } from "@rpldy/sender";
import type { BatchItem } from "@rpldy/shared";
import type { ChunkedSender, OnProgress } from "@rpldy/chunked-sender";
import type { TusState, InitData } from "./types";

//TODO - add metadata from file (name, size, date)
//TODO - resume if options.resume and fingerprint match
//TODO - need to handle relative link in resume/parallel
//TODO - if has feature detection results - for example: check if parallel ext supported by server - if not - disable options.parallel
//TODO - persist feature detection in session state per server(url)
//TODO - need to cleanup - use item finish (abort/cancel?) to know if can be removed !
//TODO - support "Upload-Metadata" header - get from sendOptions.params
//TODO - need to support https://tus.io/protocols/resumable-upload.html#creation-with-upload
//TODO - support Upload-Expires - store expiration and dont allow to resume expired
//TODO - E2E - test abort works

const handleInitResult = (
    items: BatchItem[],
    url: string,
    sendOptions: SendOptions,
    onProgress: OnProgress,
    tusState: TusState,
    chunkedSender: ChunkedSender,
    initRequest
) =>
    initRequest.then((initData: InitData) => {
        let request;

        if (initData) {
            if (!initData.isNew && !initData.canResume) {
                //TODO - !!!!!!!!! NEED TO CREATE - RESUME INIT FAILED
            }

            const item = items[0];
            logger.debugLog(`tusSender.handler: init request finished. sending item ${item.id} as chunked`, initData);

            if (initData.isNew) {
                persistResumable(item, initData.uploadUrl, tusState.getState().options);
            }

            //upload the file using the chunked-sender
            const chunkedResult = chunkedSender.send(items, url, sendOptions, onProgress);

            tusState.updateState((state) => {
                state.items[item.id].abort = chunkedResult.abort;
            });

            //             abortChunked = chunkedResult.abort;
            //             chunkedResult.request
            //                 .catch(reject)
            //                 .then(resolve);
            request = chunkedResult.request;
        }
        else {
            request = Promise.resolve();
        }

        return request;
    });
// };

export default (items: BatchItem[],
                url: string,
                sendOptions: SendOptions,
                onProgress: OnProgress,
                tusState: TusState,
                chunkedSender: ChunkedSender,
) => {
    const item = items[0];

    const persistedUrl = retrieveResumable(item, tusState.getState().options);

    const { initRequest, abortInit } = persistedUrl ?
        //init resumable upload - this file has already started uploading
        resumeUpload(item, persistedUrl, tusState) :
        //init new upload - first time uploading this file
        createUpload(item, url, tusState);

    const uploadRequest = handleInitResult(
        items,
        url,
        sendOptions,
        onProgress,
        tusState,
        chunkedSender,
        initRequest
    );

    const abort = () => {
        logger.debugLog(`tusSender.handler: abort called for item: ${item.id}`);
        //attempt to abort create/resume call if its still running
        abortInit();

        initRequest
            .then((data) => {
                if (data) {
                    logger.debugLog(`tusSender.handler: aborting chunked upload for item:  ${item.id}`);

                    const abortChunked = tusState.getState().items[item.id].abort;

                    if (abortChunked) {
                        abortChunked();
                    }
                }
            });

        return true;
    };

    return {
        request: uploadRequest,
        abort,
    };
};

