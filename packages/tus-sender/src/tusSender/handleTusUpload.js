// @flow
import { FILE_STATES, logger } from "@rpldy/shared";
import createUpload from "./createUpload";
import resumeUpload from "./resumeUpload";
import { persistResumable, retrieveResumable } from "./resumableStore";

import type { SendOptions } from "@rpldy/sender";
import type { BatchItem } from "@rpldy/shared";
import type { ChunkedSender, OnProgress } from "@rpldy/chunked-sender";
import type { TusState, InitData } from "./types";

//TODO - need to cleanup - use item finish (abort/cancel?) to know if can be removed !
//TODO - support defer length - add length in the end
//TODO - need to support creation with upload https://tus.io/protocols/resumable-upload.html#creation-with-upload
//TODO - support parallel uploads
//TODO - support Upload-Expires - store expiration and dont allow to resume expired
//TODO - if has feature detection results - for example: check if parallel ext supported by server - if not - disable options.parallel
//TODO - persist feature detection in session state per server(url)
//TODO - unit tests ~100%
//TODO - E2E - test resume/abort/resume-done works
//TODO - E2E - test resume with delay

const doChunkedUploadForItem = (
    items: BatchItem[],
    url: string,
    sendOptions: SendOptions,
    onProgress: OnProgress,
    tusState: TusState,
    chunkedSender: ChunkedSender,
    initData: InitData,
) => {
    const item = items[0];
    logger.debugLog(`tusSender.handler: init request finished. sending item ${item.id} as chunked`, initData);

    if (initData.isNew && initData.uploadUrl) {
        persistResumable(item, initData.uploadUrl, tusState.getState().options);
    }
    else if (initData.canResume) {
        sendOptions = {
            ...sendOptions,
            startByte: initData.offset,
        };
    }

    //upload the file using the chunked-sender
    const chunkedResult = chunkedSender.send(items, url, sendOptions, onProgress);

    tusState.updateState((state) => {
        state.items[item.id].abort = chunkedResult.abort;
    });

    return chunkedResult.request;
};

const handleInitResult = (
    items: BatchItem[],
    url: string,
    sendOptions: SendOptions,
    onProgress: OnProgress,
    tusState: TusState,
    chunkedSender: ChunkedSender,
    initRequest,
    isResume?: boolean,
) =>
    initRequest.then(async (initData: ?InitData) => {
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
            request = await handleInitResult(items, url, sendOptions, onProgress, tusState, chunkedSender, createRequest);
        }

        return request || Promise.resolve({
            status: 0,
            state: FILE_STATES.ERROR,
            response: "TUS initialize failed",
        });
    });

export default (items: BatchItem[],
                url: string,
                sendOptions: SendOptions,
                onProgress: OnProgress,
                tusState: TusState,
                chunkedSender: ChunkedSender,
) => {
    const item = items[0];
    const persistedUrl = retrieveResumable(item, tusState.getState().options);

    const { request: initRequest, abort: abortInit } = persistedUrl ?
        //init resumable upload - this file has already started uploading
        resumeUpload(item, persistedUrl, tusState) :
        //init new upload - first time uploading this file
        createUpload(item, url, tusState, sendOptions);

    const uploadRequest = handleInitResult(
        items,
        url,
        sendOptions,
        onProgress,
        tusState,
        chunkedSender,
        initRequest,
        !!persistedUrl,
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

