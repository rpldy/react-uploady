// @flow
import { createBatchItem, FILE_STATES, logger } from "@rpldy/shared";
import { createChunkedSender, getChunkDataFromFile, DEFAULT_CHUNK_SIZE } from "@rpldy/chunked-sender";
import { createResumeSuccessResult, getHeadersWithoutContentRange } from "../utils";
import { retrieveResumable } from "../../resumableStore";
import handleParallelTusUpload from "../handleParallelTusUpload";
import initTusUpload from "./initTusUpload";
import createStateItemData from "./createStateItemData";
import resumeUpload from "./resumeUpload";

import type { BatchItem } from "@rpldy/shared";
import type { TriggerMethod } from "@rpldy/life-events";
import type { OnProgress } from "@rpldy/sender";
import type { ChunkedSender, ChunkedSendOptions } from "@rpldy/chunked-sender";
import type { State, TusOptions, TusState } from "../../types";
import type { ParallelPartData, InitRequestResult } from "../types";

const getPartStartEnd = (item: BatchItem, parallels: number, chunkSize: number, partIdx: number) => {
    const fileSize = item.file.size;
    const partSize = Math.ceil(fileSize / parallels);
    const start = (partSize * partIdx);
    const end = Math.min((partSize * (partIdx + 1)), fileSize);

    return { start, end };
};

const getParallelPartData = (item: BatchItem, partIdx: number, parallels: number, chunkSize: number): ParallelPartData => {
    const { start, end } = getPartStartEnd(item, parallels, chunkSize, partIdx);
    const partData = getChunkDataFromFile(item.file, start, end);

    return {
        identifier: `prll_${parallels}_p${partIdx}`,
        item: createBatchItem(partData, `${item.id}_tusPrll`),
        start,
        end,
        orgItemId: item.id,
    };
};

const initItemStateWithParallelData = (tusState: TusState, item: BatchItem, options: TusOptions, parallels: number): ParallelPartData[] =>
    Array.from({ length: parallels }, (_, i) => {
        const ppData = getParallelPartData(item, i, parallels, (options.chunkSize || DEFAULT_CHUNK_SIZE));

        tusState.updateState((state: State) => {
            state.items[item.id].parallelParts = state.items[item.id].parallelParts || [];
            state.items[item.id].parallelParts.push(ppData);
        });

        return ppData;
    });

const issueParallelRequestsForItem = (
    tusState: TusState,
    parts: ParallelPartData[],
    url: string,
    sendOptions: ChunkedSendOptions,
    onProgress: OnProgress,
    parallelChunkSender: ChunkedSender,
    trigger: TriggerMethod,
) => {
    return parts.map((pp) =>
        initTusUpload(
            [pp.item],
            url,
            {
                ...sendOptions,
                headers: getHeadersWithoutContentRange(sendOptions.headers),
                //params will be sent as metadata with the finalizing request
                params: null,
            },
            onProgress,
            tusState,
            parallelChunkSender,
            trigger,
            pp.identifier,
            pp.orgItemId
        ));
};

const createParallelUpload = (
    item: BatchItem,
    url: string,
    sendOptions: ChunkedSendOptions,
    onProgress: OnProgress,
    tusState: TusState,
    trigger: TriggerMethod
): InitRequestResult => {
    const { options } = tusState.getState();
    const parallels = +options.parallel;

    logger.debugLog(`tusSender: init parallel upload for item: ${item.id}, with ${parallels} parallel parts`);
    const parts = initItemStateWithParallelData(tusState, item, options, parallels);

    //must turn off parallel so chunked-sender only sends one at a time
    const parallelChunkSender = createChunkedSender({ ...options, parallel: 1 }, trigger);

    const parallelReqs = issueParallelRequestsForItem(
        tusState,
        parts,
        url,
        sendOptions,
        onProgress,
        parallelChunkSender,
        trigger
    );

    const abort = () => {
        logger.debugLog(`tusSender.parallel: abort called for item : ${item.id} with ${parallels} parallel parts`);
        parallelReqs.forEach((pr) => pr.abort());
        return true;
    };

    //wrap around the parallel requests so we can finalize them as one tus upload
    const request = Promise.all(parallelReqs.map((pr) => pr.request))
        .then((data) => {
            const failedReq = data.find((d) => d.state !== FILE_STATES.FINISHED);

            return {
                status: failedReq?.status ?? data[0].status,
                state: failedReq?.state || FILE_STATES.FINISHED,
                response: failedReq?.response || data[0].response,
            };
        });

    return {
        request: handleParallelTusUpload(item, url, tusState, sendOptions, request),
        abort
    };
};

const resumeParallelUpload = (
    persistedUrl: string,
    item: BatchItem,
    url: string,
    sendOptions: ChunkedSendOptions,
    onProgress: OnProgress,
    tusState: TusState,
    trigger: TriggerMethod
): InitRequestResult => {
    const resumeReq = resumeUpload(item, persistedUrl, tusState, trigger);
    let afterResumeParallelAbort;

    const afterResumeRequest = resumeReq.request.then((data) => {
        const { isDone, uploadUrl } = (data || { uploadUrl: "", isDone: false });
        let resRequest;

        if (isDone) {
            logger.debugLog(`tusSender: resume found server has completed file for item: ${item.id}`, item);
            resRequest = createResumeSuccessResult(uploadUrl);
        } else {
            //we can safely call initParallelTusUpload (recursively) because failed resume will remove the persistedUrl
            const {
                request: prllRequest,
                abort: prllAbort
            } = initParallelTusUpload([item], url, sendOptions, onProgress, tusState, trigger);

            afterResumeParallelAbort = prllAbort;
            resRequest = prllRequest;
        }

        return resRequest;
    });

    const abort = () => {
        resumeReq.abort();
        afterResumeParallelAbort?.();
        return true;
    };

    return {
        request: afterResumeRequest,
        abort,
    };
};

const initParallelTusUpload = (
    items: BatchItem[],
    url: string,
    sendOptions: ChunkedSendOptions,
    onProgress: OnProgress,
    tusState: TusState,
    trigger: TriggerMethod,
): InitRequestResult => {
    const { options } = tusState.getState();
    const item = items[0];
    const persistedUrl = retrieveResumable(item, options);

    //need to create state for the item that starts the parallel tus parts uploads
    createStateItemData(item, tusState, options);

    return persistedUrl ?
        resumeParallelUpload(persistedUrl, item, url, sendOptions, onProgress, tusState, trigger) :
        createParallelUpload(item, url, sendOptions, onProgress, tusState, trigger);
};

export default initParallelTusUpload;
