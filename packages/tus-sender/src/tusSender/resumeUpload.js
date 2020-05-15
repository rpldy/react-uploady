// @flow
import { logger, request } from "@rpldy/shared";
import { SUCCESS_CODES } from "./consts";
import { removeResumable  } from "./resumableStore";

import type { BatchItem } from "@rpldy/shared";
import type { InitUploadResult, TusState } from "./types";

const handleSuccessfulResumeResponse = (item: BatchItem, url: string, tusState: TusState, resumeResponse: XMLHttpRequest) => {
    let canResume = false,
        isDone = false,
        offset;

    logger.debugLog(`tusSender.resume - successfully initiated resume for item: ${item.id} - upload url = ${url}`);

    offset = parseInt(resumeResponse.getResponseHeader("Upload-Offset"));

    if (!isNaN(offset)) {
        const length = parseInt(resumeResponse.getResponseHeader("Upload-Length"));

        if (!isNaN(length)) {
            isDone = offset === length;
            canResume = !isDone;
        }
    }

    return {
        offset,
        uploadUrl: url,
        isNew: false,
        isDone,
        canResume,
    };
};

export default (item: BatchItem, url: string, tusState: TusState): InitUploadResult => {
    const { options } = tusState.getState();
    const headers = {
        "tus-resumable": options.version,
    };

    // if (options.deferLength) {
    //     headers["Upload-Defer-Length"] = 1;
    // } else {
    //     headers["Upload-Length"] = item.file.size;
    // }
    //
    logger.debugLog(`tusSender.resume - resuming upload for ${item.id} at: ${url}`);

    const pXhr = request(url, null, { method: "HEAD", headers });

    let resumeFinished = false;

    const resumeRequest = pXhr
        .then((resumeResponse) => {
            let result = null;

            if (resumeResponse && ~SUCCESS_CODES.indexOf(resumeResponse.status)) {
                result = handleSuccessfulResumeResponse(item, url, tusState, resumeResponse);
            } else if (resumeResponse?.status === 423) {
                logger.debugLog(`tusSender.resume: upload is locked for item: ${item.id}. Need to retry`, resumeResponse);


                //TODO - !!!!!!!!! RETRY LOCKED UPLOAD !!!!!!!!!!!

            } else {
                logger.debugLog(`tusSender.resume: create upload failed for item: ${item.id}`, resumeResponse);

                removeResumable(item, options);

                result = {
                    isNew: false,
                    canResume: false,
                };
            }

            return result;
        })
        .catch((error) => {
            logger.debugLog(`tusSender.create: create upload failed`, error);

            return {
                isNew: false,
                canResume: false,
            };
        })
        .finally(()=> {
            resumeFinished = true;
        });


    const abortResume = () => {
        if (!resumeFinished) {
            logger.debugLog(`tusSender.resume: aborting resume request for item: ${item.id}`);
            pXhr.xhr.abort();
        }

        return !resumeFinished;
    };

    return {
        resumeRequest,
        abortResume,
    };
};
