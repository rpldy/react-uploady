// @flow
import { logger, request, triggerUpdater, getMerge, XhrPromise } from "@rpldy/shared";
import { unwrap } from "@rpldy/simple-state";
import { SUCCESS_CODES, TUS_EVENTS } from "../../consts";
import { removeResumable } from "../../resumableStore";

import type { BatchItem } from "@rpldy/shared";
import type { TriggerMethod } from "@rpldy/life-events";
import type { InitData, InitUploadResult, ResumeStartEventData, ResumeStartEventResponse } from "../types";
import type { State, TusState, TusOptions } from "../../types";

const mergeWithUndefined = getMerge({ undefinedOverwrites: true });

const handleSuccessfulResumeResponse = (item: BatchItem, url: string, tusState: TusState, resumeResponse: XMLHttpRequest) => {
    logger.debugLog(`tusSender.resume - successfully initiated resume for item: ${item.id} - upload url = ${url}`);

    let canResume = false,
		isDone = false;
	const offset = parseInt(resumeResponse.getResponseHeader("Upload-Offset"));

	if (!isNaN(offset)) {
		const length = parseInt(resumeResponse.getResponseHeader("Upload-Length"));

		if (!isNaN(length) || tusState.getState().options.deferLength) {
			isDone = offset === length;
			canResume = !isDone;

			tusState.updateState((state: State) => {
				//update state with resume response for item
				state.items[item.id].uploadUrl = url;
				state.items[item.id].offset = offset;
			});
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

const resumeWithDelay = (
    item: BatchItem,
    url: string,
    tusState: TusState,
    trigger: TriggerMethod,
    parallelIdentifier: ?string,
    attempt: number
) =>
	new Promise<?InitData>((resolve) => {
		setTimeout(() => {
			makeResumeRequest(item, url, tusState, trigger, parallelIdentifier, attempt)
				.request.then(resolve);
		}, tusState.getState().options.lockedRetryDelay);
	});

const handleResumeFail = (item: BatchItem, options: TusOptions, parallelIdentifier: ?string) => {
	removeResumable(item, options, parallelIdentifier);

	return {
        uploadUrl: "",
		isNew: false,
		canResume: false,
	};
};

const handleResumeResponse = (
    resumeResponse: XMLHttpRequest,
    item: BatchItem,
    url: string,
    tusState: TusState,
    trigger: TriggerMethod,
    parallelIdentifier: ?string,
    attempt: number
) => {
    let result;
    const { options } = tusState.getState();

    if (resumeResponse && ~SUCCESS_CODES.indexOf(resumeResponse.status)) {
        result = handleSuccessfulResumeResponse(item, url, tusState, resumeResponse);
    } else if (resumeResponse?.status === 423 && attempt === 0) {
        logger.debugLog(`tusSender.resume: upload is locked for item: ${item.id}. Will retry in ${+options.lockedRetryDelay}`,
            resumeResponse);
        //Make one more attempt at resume
        result = resumeWithDelay(item, url, tusState, trigger, parallelIdentifier, 1);
    } else {
        logger.debugLog(`tusSender.resume: failed for item: ${item.id}${parallelIdentifier ? `-${parallelIdentifier}` : ""}`,
            resumeResponse);
        result = handleResumeFail(item, options, parallelIdentifier);
    }

    return result;
};

type UpdatedRequestResult = () => XhrPromise;

const getUpdatedRequest = (
    item: BatchItem,
    url: string,
    tusState: TusState,
    trigger: TriggerMethod
): Promise<UpdatedRequestResult & boolean> => {
    const { options } = tusState.getState();

    return triggerUpdater<ResumeStartEventData>(trigger, TUS_EVENTS.RESUME_START, {
        url,
        item: unwrap(item),
        resumeHeaders: unwrap(options.resumeHeaders),
    })
        // $FlowIssue - https://github.com/facebook/flow/issues/8215
        .then((response: ResumeStartEventResponse | boolean) => {
            let result;

            const updatedData = typeof response === "boolean" ? (response === false ? { stop: true } : {}) : (response || {});

            if (updatedData.stop) {
                logger.debugLog(`tusSender.resume: received false from TUS RESUME_START event - cancelling resume attempt for item: ${item.id}`);
            } else {
                result = request(
                    updatedData?.url || url,
                    null,
                    {
                        method: "HEAD",
                        headers: mergeWithUndefined(
                            { "tus-resumable": options.version },
                            options.resumeHeaders,
                            updatedData?.resumeHeaders)
                    });
            }

            return () => result;
        });
};

const makeResumeRequest = (
    item: BatchItem,
    url: string,
    tusState: TusState,
    trigger: TriggerMethod,
    parallelIdentifier: ?string,
    attempt: number
): InitUploadResult => {
    const { options } = tusState.getState();
    let resumeFinished = false, resumeAborted = false;

	logger.debugLog(`tusSender.resume - resuming upload for ${item.id}${parallelIdentifier ? `-${parallelIdentifier}` : ""} at: ${url}`);

    const updateRequestPromise = getUpdatedRequest(item, url, tusState, trigger);

    const updatedRequest: Promise<?InitData> = updateRequestPromise.then((getXhr) => {
        resumeFinished = !getXhr();
        const callOnFail = () => handleResumeFail(item, options, parallelIdentifier);

        return !resumeFinished && !resumeAborted ?
            getXhr()
                .then((resumeResponse: XMLHttpRequest) => {
                    return (resumeFinished || resumeAborted) ?
                        callOnFail() :
                        handleResumeResponse(resumeResponse, item, url, tusState, trigger, parallelIdentifier, attempt);
                })
                .catch((error) => {
                    logger.debugLog(`tusSender.resume: resume upload failed unexpectedly`, error);
                    return callOnFail();
                })
                .finally(() => {
                    resumeFinished = true;
                }) :
            Promise.resolve(callOnFail());
    });

    const abortResume = () => {
        if (!resumeFinished) {
            logger.debugLog(`tusSender.resume: aborting resume request for item: ${item.id}`);
            resumeFinished = true;
            resumeAborted = true;

            updateRequestPromise.then((getXhr) => {
                const pXhr = getXhr();
                pXhr?.xhr?.abort();
            });
        }

        return !resumeFinished;
    };

    return {
        request: updatedRequest,
        abort: abortResume,
    };
};

const resumeUpload = (
    item: BatchItem,
    url: string,
    tusState: TusState,
    trigger: TriggerMethod,
    parallelIdentifier: ?string
): InitUploadResult =>
    makeResumeRequest(item, url, tusState, trigger, parallelIdentifier, 0);

export default resumeUpload;
