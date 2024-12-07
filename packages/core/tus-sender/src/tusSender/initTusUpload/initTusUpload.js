// @flow
import { logger } from "@rpldy/shared";
import { retrieveResumable } from "../../resumableStore";
import createUpload from "./createUpload";
import resumeUpload from "./resumeUpload";
import handleTusUpload from "../handleTusUpload";
import createStateItemData from "./createStateItemData";

import type { BatchItem } from "@rpldy/shared";
import type { TriggerMethod } from "@rpldy/life-events";
import type { ChunkedSender, ChunkedSendOptions, OnProgress } from "@rpldy/chunked-sender";
import type { TusState } from "../../types";
import type { InitRequestResult } from "../types";

const initTusUpload =  (items: BatchItem[],
                        url: string,
                        sendOptions: ChunkedSendOptions,
                        onProgress: OnProgress,
                        tusState: TusState,
                        chunkedSender: ChunkedSender,
                        trigger: TriggerMethod,
                        parallelIdentifier: ?string = null,
                        orgItemId: ?string = null,
): InitRequestResult => {
    const { options } = tusState.getState(),
        item = items[0],
        persistedUrl = retrieveResumable(item, options, parallelIdentifier);

    createStateItemData(item, tusState, options, parallelIdentifier, orgItemId);

    const initCall = persistedUrl ?
        //init resumable upload - this file has already started uploading
        resumeUpload(item, persistedUrl, tusState, trigger, parallelIdentifier) :
        //init new upload - first time uploading this file
        createUpload(item, url, tusState, sendOptions, parallelIdentifier);

    const uploadRequest = handleTusUpload(
        items,
        url,
        sendOptions,
        onProgress,
        tusState,
        chunkedSender,
        initCall.request,
        !!persistedUrl,
        parallelIdentifier
    );

    const abort = () => {
        logger.debugLog(`tusSender.handler: abort called for item: ${item.id}`);
        //attempt to abort create/resume call if its still running
        initCall.abort();

        initCall.request
            .then((data) => {
                if (data) {
                    logger.debugLog(`tusSender.handler: aborting chunked upload for item:  ${item.id}`);
                    const abortChunked = tusState.getState().items[item.id].abort;

                    abortChunked?.();
                }
            });

        return true;
    };

    return {
        request: uploadRequest,
        abort,
    };
};

export default initTusUpload;
