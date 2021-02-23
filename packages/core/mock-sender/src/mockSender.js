// @flow
import { logger, FILE_STATES } from "@rpldy/shared";
import { MOCK_SENDER_TYPE } from "./consts";
import { MOCK_DEFAULTS } from "./defaults";

import type { UploadData, BatchItem, } from "@rpldy/shared";

import type {
    SendResult,
    SendOptions,
    OnProgress,
    SenderProgressEvent,
} from "@rpldy/sender";

import type { MockOptions, MandatoryMockOptions, } from "./types";

type MockResponse = {
	time: number,
	progressEvents: SenderProgressEvent[]
};

const createRequest = (options: MandatoryMockOptions, items: BatchItem[]) => {
	const start = performance.now();
	const progressEventsData: SenderProgressEvent[] = [];

	let isCancelled = false,
		isDone = false,
		progressCallback = null,
		progressTimeouts = null,
		cancelRequest = null;

	const clearTimeouts = () => {
		if (progressTimeouts) {
			progressTimeouts.forEach((handle) => {
                clearTimeout(handle);
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
		return true;
	};

	const onProgress = (cb) => {
		progressCallback = cb;
	};

	const p = new Promise((resolve, reject) => {
		cancelRequest = reject;

		setTimeout(() => {
			isDone = true;
			resolve({
				options,
				time: (performance.now() - start),
				progressEvents: progressEventsData,
			});
			clearTimeouts();
		}, options.delay || 0);
	});

	if (options.progressIntervals) {
		progressTimeouts = options.progressIntervals.map((amount: number) => {
			const perc = (amount / 100);
			const ms = (options.delay || 0) * perc;

			return setTimeout(() => {
				if (!isCancelled && !isDone && progressCallback) {

					const event = {
						total: options.fileSize || 0,
						loaded: (options.fileSize || 0) * perc,
					};

					progressEventsData.push(event);
					progressCallback(event, items);
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

const processResponse = (request, options: MandatoryMockOptions, sendOptions: SendOptions): Promise<UploadData> => {
	return request.then((mockResponse: MockResponse) => {
		logger.debugLog("uploady.mockSender: mock request finished successfully");

		const mockResponseData =  {
            sendOptions,
            mock: true,
            success: true,
        };

		const mockHeaders = { "x-request-type": "react-uploady.mockSender" };

		const mockStatus = options.responseStatus || 200;

		return {
            status: mockStatus,
			state: FILE_STATES.FINISHED,
			response: {
				...mockResponse,
				headers: mockHeaders,
				data: options.response ||
                    sendOptions.formatServerResponse?.(JSON.stringify(mockResponseData), mockStatus, mockHeaders) ||
                    mockResponseData,
			}
		};
	})
		.catch(() => {
			logger.debugLog("uploady.mockSender: mock request was aborted");

			return {
                status: 0,
                state: FILE_STATES.ABORTED,
                response: "abort",
			};
		});
};

export default (options?: MockOptions) => {
	let mockOptions: MandatoryMockOptions = { ...MOCK_DEFAULTS, ...options };

	const update = (updated: MockOptions) => {
		mockOptions = { ...mockOptions, ...updated };
	};

	const send = (items: BatchItem[], url: ?string, sendOptions: SendOptions, onProgress: OnProgress): SendResult => {
		logger.debugLog("uploady.mockSender: about to make a mock request for items: ", items);
		const request = createRequest(mockOptions, items);

		request.onProgress(onProgress);

		return {
			request: processResponse(request, mockOptions, sendOptions),
			abort: request.abort,
            senderType: MOCK_SENDER_TYPE,
		};
	};

	return {
		send,
		update,
	};
};
