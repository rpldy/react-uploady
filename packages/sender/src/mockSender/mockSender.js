// @flow
import { merge } from "lodash";
import { logger, FILE_STATES } from "@rupy/shared";
import { MOCK_DEFAULTS } from "./defaults";

import type { SendResult, SendOptions, UploadData, OnProgress, BatchItem } from "@rupy/shared";
import type { MockOptions, MandatoryMockOptions } from "../types";

const createRequest = (options: MandatoryMockOptions) => {

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
			console.log("!!!!!!! ");
			isDone = true;
			resolve();
			clearTimeouts();
		}, options.delay);
	});

	if (options.progressEvents) {
		progressTimeouts = options.progressEvents.map((amount: number) => {
			const perc = (amount / 100);
			const ms = (options.delay || 0) * perc;
			return setTimeout(() => {
				if (!isCancelled && !isDone && progressCallback) {
					progressCallback({
						total: options.fileSize || 0,
						loaded: (options.fileSize || 0) * perc,
					});
				}
			}, ms);
		});
	}

	return {
		then: p.then.bind(p),
		abort,
		onProgress,
	};
};

const processResponse = (request, options: MandatoryMockOptions): Promise<UploadData> => {
	return request.then(() => {
		logger.debugLog("uploady.mockSender: mock request finished successfully");

		return {
			state: FILE_STATES.FINISHED,
			response: {
				headers: { "x-request-type": "react-uploady.mockSender" },
				data: options.response || {
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

	let mockOptions: MandatoryMockOptions = merge({}, MOCK_DEFAULTS, options);

	const update = (updated: MockOptions) => {
		mockOptions = merge(mockOptions, updated);
	};

	const send = (item: BatchItem, url: string, sendOptions: SendOptions, onProgress: OnProgress): SendResult => {
		logger.debugLog("uploady.mockSender: about to make a mock request for item: ", item);
		const request = createRequest(mockOptions);

		request.onProgress(onProgress);

		return {
			request: processResponse(request, mockOptions),
			abort: request.abort,
		};
	};

	return {
		send,
		update,
	};
};