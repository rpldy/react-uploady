// @flow
import { merge } from "lodash";
import { logger, FILE_STATES } from "@rupy/shared";
import { MOCK_DEFAULTS } from "./defaults";

import type { FileState, SendResult, SendOptions, UploadData, OnProgress } from "@rupy/shared";
import type { MockOptions,  } from "../types";

const createRequest = (options: MockOptions) => {

	let isCancelled = false,
		isDone = false,
		progressCallback = null,
		progressTimeouts = null,
		cancelRequest = null;

	const clearTimeouts = () => {
		if (progressTimeouts) {
			progressTimeouts.forEach((handle) => {
				if (handle) {
					clearTimeout(handle);
				}
			});

			progressTimeouts = null;
		}
	};

	const abort = () => {
		isCancelled = true;
		isDone = true;

		if (cancelRequest) {
			cancelRequest();
		}

		clearTimeouts();
	};

	const onProgress = (cb) => {
		progressCallback = cb;
	};

	const p = new Promise((resolve, reject) => {
		cancelRequest = reject;

		setTimeout(() => {
			isDone = true;
			resolve();
			clearTimeouts();
		}, options.delay);
	});

	if (options.progressEvents) {
		progressTimeouts = options.progressEvents.map((perc) => {
			const ms = options.delay * (perc / 100);
			return setTimeout(() => {
				if (!isCancelled && !isDone && progressCallback) {
					progressCallback(perc);
				}
			}, ms);
		});
	}

	return {
		then: p.then.bind(p),
		abort,
		onProgress,
	}
};

const processResponse = (request, options: MockOptions): Promise<UploadData> => {
	return request.then(() => {
		logger.debugLog("uploady.mockSender: mock request finished successfully");

		return {
			state: FILE_STATES.FINISHED,
			response: {
				headers: { "x-request-type": "react-uploady.mockSender" },
				data: {
					mock: true,
					success: true,
				}
			}
		};
	})
		.catch(() => {
			logger.debugLog("uploady.mockSender: mock request was aborted");

			return {
				state: FILE_STATES.CANCELLED,
				response: "abort",
			};
		});
};

export default (options?: MockOptions) => {

	let sendOptions = merge({}, MOCK_DEFAULTS, options);

	const update = (updated: MockOptions) => {
		sendOptions = merge(sendOptions, updated);
	};

	const send = (item: BatchItem, url: string, sendOptions: SendOptions, onProgress: OnProgress): SendResult => {
		logger.debugLog("uploady.mockSender: about to make a mock request");
		const request = createRequest(sendOptions);

		request.onProgress(onProgress);

		return {
			request: processResponse(request, options),
			abort: request.abort,
		};
	};

	return {
		send,
		update,
	};
};