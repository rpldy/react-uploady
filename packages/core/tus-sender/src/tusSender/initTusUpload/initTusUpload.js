// @flow
import { logger } from "@rpldy/shared";
import { PART_UPLOAD_STATES } from "../../consts";
import { retrieveResumable } from "../../resumableStore";
import createUpload from "./createUpload";
import resumeUpload from "./resumeUpload";
import handleTusUpload from "../handleTusUpload";

import type { BatchItem, UploadData } from "@rpldy/shared";
import type { TriggerMethod } from "@rpldy/life-events";
import type { ChunkedSender, ChunkedSendOptions, OnProgress } from "@rpldy/chunked-sender";
import type { TusState, State, TusOptions } from "../../types";
import type { ParallelPartData } from "../types";

const initParallelInfo = (options: TusOptions, item: BatchItem): ParallelPartData[] => {
    const parallels = +options.parallel;
    return Array.from({ length: parallels }).map((_, i) => ({
        identifier: `${item.id}_parallel-part_${i}`,
        state: PART_UPLOAD_STATES.UNKNOWN,
        uploadUrl: null,
        lastOffset: 0,
        chunkIds: [],
        partSize: Math.floor(item.file.size / parallels),
    }));
};

const createStateItemData = (
    item: BatchItem,
    tusState: TusState,
    options: TusOptions,
    isParallel: boolean,
    parallelIdentifier: ?string,
    orgItemId: ?string
) => {
    tusState.updateState((state: State) => {
        state.items[item.id] = {
            id: item.id,
            uploadUrl: null,
            size: item.file.size,
            offset: 0,
            parallelParts: isParallel ? initParallelInfo(options, item) : [],
            //will be populated only for items that represent a parallel chunk:
            parallelIdentifier,
            orgItemId,
        };
    });
};

const isPartUrlCreated = (tusState: TusState, orgItemId: ?string, parallelIdentifier: ?string): boolean => {
    let isUrlCreated = false;

    if (parallelIdentifier && orgItemId) {
        const ppData = tusState.getState().items[orgItemId]
            .parallelParts.find((pd) => pd.identifier === parallelIdentifier);
        isUrlCreated = !!ppData?.uploadUrl && ppData?.state !== PART_UPLOAD_STATES.UNKNOWN ;
    }

    return isUrlCreated;
};

const initTusUpload =  (items: BatchItem[],
                        url: string,
                        sendOptions: ChunkedSendOptions,
                        onProgress: OnProgress,
                        tusState: TusState,
                        chunkedSender: ChunkedSender,
                        trigger: TriggerMethod,
                        parallelIdentifier: ?string = null,
                        orgItemId: ?string = null,
): {|abort: () => boolean, request: Promise<UploadData>|} => {
    const { options } = tusState.getState(),
        //parallel upload when we're seeing the batch item, not the parallel chunk items
        isParallel = +options.parallel > 1 && !parallelIdentifier,
        item = items[0],
        persistedUrl = (!isParallel && !parallelIdentifier) ?
                retrieveResumable(item, options, parallelIdentifier) : null;

    createStateItemData(item, tusState, options, isParallel, parallelIdentifier, orgItemId);

    let initCall;

    if (isParallel || isPartUrlCreated(tusState, orgItemId, parallelIdentifier)) {
        //we don't need a create call for parallel uploads. Each parallel part will have one.
        initCall = {
            request: Promise.resolve({
                isNew: true,
            }),
            abort: () => true,
        };
    } else {
        initCall = persistedUrl ?
            //init resumable upload - this file has already started uploading
            resumeUpload(item, persistedUrl, tusState, trigger, parallelIdentifier) :
            //init new upload - first time uploading this file
            createUpload(item, url, tusState, sendOptions, parallelIdentifier);
    }

    const uploadRequest = handleTusUpload(
        items,
        url,
        sendOptions,
        onProgress,
        tusState,
        chunkedSender,
        initCall.request,
        !!persistedUrl,
        parallelIdentifier,
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

export default initTusUpload;
