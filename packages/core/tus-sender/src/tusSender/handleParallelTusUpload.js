// @flow
import { request, logger, FILE_STATES, XhrPromise } from "@rpldy/shared";
import { SUCCESS_CODES } from "../consts";
import { persistResumable } from "../resumableStore";
import { addLocationToResponse, getUploadMetadata } from "./utils";

import type { BatchItem, UploadData } from "@rpldy/shared";
import type { SendOptions } from "@rpldy/sender";
import type { State, TusState } from "../types";
import type { ParallelPartData } from "./types";

const handleFinalizeResponse = (pXhr: XhrPromise, uploadData: UploadData, tusState: TusState, item: BatchItem): Promise<UploadData> =>
    pXhr
        .catch((xhr: ?XMLHttpRequest) => {
            logger.debugLog(`tusSender.finalizeParallel: finalize request failed unexpectedly!`, xhr);
            return xhr;
        })
        .then((xhr: ?XMLHttpRequest) => {
            let result;
            const status = xhr?.status || 0;
            const successCode = !!~SUCCESS_CODES.indexOf(status);

            const resLocation = successCode &&
                (xhr && "getResponseHeader" in xhr) &&
                xhr.getResponseHeader("Location");

            if (resLocation) {
                logger.debugLog(`tusSender.finalizeParallel: successfully finalized parallel upload`, resLocation);
                result = addLocationToResponse(Promise.resolve(uploadData), resLocation);

                const { options } = tusState.getState();
                if (!options.forgetOnSuccess) {
                    persistResumable(item, resLocation, options);
                }
            } else {
                logger.debugLog(`tusSender.finalizeParallel: parallel upload finalize failed!`, status);
                result = {
                    status: status,
                    state: FILE_STATES.ERROR,
                    response: { message: xhr?.response || (successCode && !resLocation ? "No valid location header for finalize request" : "") },
                };
            }

            return result;
        });

const handleParallelTusUpload = (
    item: BatchItem,
    url: string,
    tusState: TusState,
    sendOptions: SendOptions,
    parallelRequest: Promise<UploadData>,
): Promise<UploadData> =>
    parallelRequest.then((uploadData: UploadData) => {
        let finalResult;

        if (uploadData.state === FILE_STATES.FINISHED) {
            const { options, items } = tusState.getState(),
                itemData = items[item.id];

            if (itemData) {
                const { parallelParts } = itemData;
                const parallelUploadUrls = parallelParts?.map((pp: ParallelPartData) => items[pp.item.id].uploadUrl) || [];

                if (parallelUploadUrls?.length !== options.parallel) {
                    throw new Error(`tusSender: something went wrong. found ${parallelUploadUrls.length} upload urls for ${+options.parallel} parts`);
                }

                const headers = {
                    //add the headers from the original request
                    ...sendOptions.headers,
                    "tus-resumable": options.version,
                    //we concat the parallel upload urls - there should be as many as the parallel option value
                    "Upload-Concat": `final;${parallelUploadUrls.join(" ")}`,
                    "Upload-Metadata": getUploadMetadata(sendOptions),
                };

                logger.debugLog(`tusSender.finalizeParallel: sending finalizing POST request`, { url, headers });

                const pXhr = request(url, null, { method: "POST", headers });

                tusState.updateState((state: State) => {
                    state.items[item.id].abort = () => {
                        //override the state item's abort with the finalize request abort
                        pXhr.xhr.abort();
                        return true;
                    };
                });

                finalResult = handleFinalizeResponse(pXhr, uploadData, tusState, item);
            }
        }

        return finalResult || Promise.resolve(uploadData);
    });

export default handleParallelTusUpload;
