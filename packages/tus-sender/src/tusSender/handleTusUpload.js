// @flow
import { FILE_STATES, logger } from "@rpldy/shared";
import createUpload from "./initTusUpload/createUpload";
import { persistResumable } from "./resumableStore";

import type { SendOptions } from "@rpldy/sender";
import type { BatchItem } from "@rpldy/shared";
import type { ChunkedSender, OnProgress } from "@rpldy/chunked-sender";
import type { TusState, InitData } from "./types";

//TODO - support parallel uploads
		//TODO: persist chunk to resumable store using file fingerprint + chunk size + chunk index
		//TODO: send final post request with "Upload-Concat", `final; + all chunk urls
		//TODO: add metadata only to the final post (not in the create per chunk)
		//TODO:  handle server already has file for parallelized chunk

//TODO - support Upload-Expires - store expiration and dont allow to resume expired
//TODO - if has feature detection results - for example: check if parallel ext supported by server - if not - disable options.parallel
	// - Tus-Max-Size
//TODO - persist feature detection in session state per server(url)
//TODO tus-uploady - useClearResumableStore - delete all resumable storage itemss
//TODO - unit tests ~100%
//TODO - typescript definitions + test
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
	const { options }  = tusState.getState();
    const item = items[0];
    logger.debugLog(`tusSender.handler: init request finished. sending item ${item.id} as chunked`, initData);

    if (initData.isNew && initData.uploadUrl) {
        persistResumable(item, initData.uploadUrl, options);
    }
    else if (initData.canResume || (options.sendDataOnCreate && initData.offset)) {
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

const handleTusUpload = (
    items: BatchItem[],
    url: string,
    sendOptions: SendOptions,
    onProgress: OnProgress,
    tusState: TusState,
    chunkedSender: ChunkedSender,
    initRequest,
    isResume?: boolean,
	parallelIdentifier: ?string,
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
			} else if (parallelIdentifier) {
				logger.debugLog(`tusSender.handler: created `);
				request = Promise.resolve({
					status: 200,
					response: "TUS server created upload for parallelized part",
				});
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
    });

export default handleTusUpload;

