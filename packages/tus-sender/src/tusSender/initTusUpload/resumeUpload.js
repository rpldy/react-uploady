// @flow
import { logger, request } from "@rpldy/shared";
import { SUCCESS_CODES } from "../../consts";
import { removeResumable } from "../../resumableStore";

import type { BatchItem } from "@rpldy/shared";
import type { InitUploadResult } from "../types";
import type { State, TusState, TusOptions } from "../../types";

const handleSuccessfulResumeResponse = (item: BatchItem, url: string, tusState: TusState, resumeResponse: XMLHttpRequest) => {
	let canResume = false,
		isDone = false;

	logger.debugLog(`tusSender.resume - successfully initiated resume for item: ${item.id} - upload url = ${url}`);

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

const resumeWithDelay = (item: BatchItem, url: string, tusState: TusState, parallelIdentifier: ?string, attempt: number) =>
	new Promise((resolve) => {
		setTimeout(() => {
			makeResumeRequest(item, url, tusState, parallelIdentifier, attempt)
				.request.then(resolve);
		}, tusState.getState().options.lockedRetryDelay);
	});

const handleResumeFail = (item: BatchItem, options: TusOptions, parallelIdentifier: ?string) => {
	removeResumable(item, options, parallelIdentifier);

	return {
		isNew: false,
		canResume: false,
	};
};

const makeResumeRequest = (item: BatchItem, url: string, tusState: TusState, parallelIdentifier: ?string, attempt: number) => {
	const { options } = tusState.getState();

	logger.debugLog(`tusSender.resume - resuming upload for ${item.id}${parallelIdentifier ? `-${parallelIdentifier}` : ""} at: ${url}`);

	const pXhr = request(url, null, {
		method: "HEAD",
		headers: {
			"tus-resumable": options.version,
		}
	});

	let resumeFinished = false;

	const resumeRequest = pXhr
		.then(async (resumeResponse) => {
			let result;

			if (resumeResponse && ~SUCCESS_CODES.indexOf(resumeResponse.status)) {
				result = handleSuccessfulResumeResponse(item, url, tusState, resumeResponse);
			} else if (resumeResponse?.status === 423 && attempt === 0) {
				logger.debugLog(`tusSender.resume: upload is locked for item: ${item.id}. Will retry in ${+options.lockedRetryDelay}`, resumeResponse);
				//Make one more attempt at resume
				result = await resumeWithDelay(item, url, tusState, parallelIdentifier, 1);
			} else {
				logger.debugLog(`tusSender.resume: failed for item: ${item.id}${parallelIdentifier ? `-${parallelIdentifier}` : ""}`, resumeResponse);
				result = handleResumeFail(item, options, parallelIdentifier);
			}

			return result;
		})
		.catch((error) => {
			logger.debugLog(`tusSender.resume: resume upload failed unexpectedly`, error);
			return handleResumeFail(item, options, parallelIdentifier);
		})
		.finally(() => {
			resumeFinished = true;
		});

	const abortResume = () => {
		if (!resumeFinished) {
			logger.debugLog(`tusSender.resume: aborting resume request for item: ${item.id}`);
			// $FlowFixMe
			pXhr.xhr.abort();
		}

		return !resumeFinished;
	};

	return {
		request: resumeRequest,
		abort: abortResume,
	};
};

export default (item: BatchItem, url: string, tusState: TusState, parallelIdentifier: ?string): InitUploadResult => {
	return makeResumeRequest(item, url, tusState, parallelIdentifier, 0);
};
