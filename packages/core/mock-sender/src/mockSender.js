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
	progressEvents: SenderProgressEvent[],
    items: BatchItem[]
};

type MockRequest = {
    then: ((any) => any) => Promise<any>,
    abort: () => boolean,
    onProgress: (OnProgress) => void,
}

const createRequest = (options: MandatoryMockOptions, items: BatchItem[]): MockRequest => {
	const start = performance.now();
	const progressEventsData: SenderProgressEvent[] = [];
    const totalFileSize = items.reduce((size, item) => size + (item.file?.size ?? 0), 0);

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
            //rejects the request promise
			cancelRequest();
		}

		clearTimeouts();
		return true;
	};

	const onProgress = (cb: OnProgress) => {
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
                items,
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
                    const size = options.fileSize !== undefined ? options.fileSize : (totalFileSize || 0);
					const event = {
						total: size,
						loaded: size * perc,
					};

					progressEventsData.push(event);

					progressCallback(event, items);
				}
			}, ms);
		});
	}

	return {
        //$FlowExpectedError[method-unbinding] flow 0.153 !!!
		then: p.then.bind(p),
		abort,
		onProgress,
	};
};

const getIsSuccessfulMockRequest = (
    options: MandatoryMockOptions,
    sendOptions: SendOptions,
    mockStatus: number,
    mockResponse: Object,
    mockHeaders: Object
) => {
    const getIsSuccessfulCall = options.isSuccessfulCall || sendOptions.isSuccessfulCall;

    return getIsSuccessfulCall ?
        //$FlowExpectedError[incompatible-call]
        getIsSuccessfulCall({
            //mimic xhr for mock sender
            readyState: 4,
            status: mockStatus,
            response: mockResponse,
            getAllResponseHeaders: () => mockHeaders,
        }) : true;
};

const processResponse = (request: MockRequest, options: MandatoryMockOptions, sendOptions: SendOptions): Promise<UploadData> => {
	return request.then(({ items, ...mockResponse }: MockResponse) => {
		logger.debugLog("uploady.mockSender: mock request finished successfully", items);

		const mockHeaders = { "x-request-type": "react-uploady.mockSender" };
		const mockStatus = options.responseStatus || 200;

        const mockResponseData = {
            sendOptions,
            mock: true,
            success: getIsSuccessfulMockRequest(options, sendOptions, mockStatus, mockResponse, mockHeaders),
        };

        return {
            status: mockStatus,
			state: mockResponseData.success ? FILE_STATES.FINISHED : FILE_STATES.ERROR,
			response: {
				...mockResponse,
				headers: mockHeaders,
				data: options.response ||
                    sendOptions.formatServerResponse?.(JSON.stringify(mockResponseData), mockStatus, mockHeaders) ||
                    mockResponseData,
			}
		};
	})
		.catch((err) => {
			logger.debugLog("uploady.mockSender: mock request was aborted", err);

			return {
                status: 0,
                state: FILE_STATES.ABORTED,
                response: "abort",
			};
		});
};

const mockSender = (options?: MockOptions): {|
    send: (
        items: Array<BatchItem>,
        url: ?string,
        sendOptions: SendOptions,
        onProgress: OnProgress
    ) => SendResult,
    update: (updated: MockOptions) => void,
|} => {
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

export default mockSender;
