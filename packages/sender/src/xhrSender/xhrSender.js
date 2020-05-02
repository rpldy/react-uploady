// @flow
import { logger, FILE_STATES } from "@rpldy/shared";
import prepareFormData from "./prepareFormData";

import type {
	BatchItem,
	UploadData,
} from "@rpldy/shared";

import type { OnProgress, SendResult, SendOptions } from "../types";

type Headers = { [string]: string };

type SendRequest = {
	url: string,
	count: number,
	pXhr: Promise<XMLHttpRequest>,
	xhr: XMLHttpRequest,
	aborted: boolean,
};

export const SUCCESS_CODES = [200, 201, 202, 203, 204];

const setHeaders = (req, options: SendOptions) => {
	const headers = {
		...(options.headers || {}),
	};

	Object.keys(headers).forEach((name) =>
		req.setRequestHeader(name, headers[name]));
};

const makeRequest = (items: BatchItem[], url: string, options: SendOptions, onProgress: ?OnProgress): SendRequest => {
	const req = new XMLHttpRequest();

	const pXhr = new Promise((resolve, reject) => {
		const formData = prepareFormData(items, options);

		req.onerror = () => reject(req);
		req.ontimeout = () => reject(req);
		req.onabort = () => reject(req);
		req.onload = () => resolve(req);

		req.onprogress = (e) => {
            console.log("################ XHR PROGRESS !!!!!!!!!!! ", e);
        };

		req.upload.onprogress = (e) => {
            console.log("################ XHR UPLOAD PROGRESS !!!!!!!!!!! ", e);
			if (e.lengthComputable && onProgress) {
				onProgress(e, items.slice());
			}
		};

		req.open(options.method, url);
		setHeaders(req, options);
		req.withCredentials = !!options.withCredentials;
		req.send(formData);
	});

	return {
		url,
		count: items.length,
		pXhr,
		xhr: req,
		aborted: false,
	};
};

const getResponseHeaders = (xhr: XMLHttpRequest): ?Headers => {
	let resHeaders;

	try {
		resHeaders = xhr.getAllResponseHeaders().trim()
			.split(/[\r\n]+/)
			.reduce((res, line: string) => {
				const [key, val] = line.split(": ");
				res[key] = val;
				return res;
			}, {});
	} catch (ex) {
		logger.debugLog("uploady.sender: failed to read response headers", xhr);
	}

	return resHeaders;
};

const parseResponseJson = (response: string, headers: ?Headers, options: SendOptions): string | Object => {
	let parsed = response;

	const ct = headers && headers["content-type"];

	if (options.forceJsonResponse || (ct && ~ct.indexOf("json"))) {
		try {
			parsed = JSON.parse(response);
		} catch { //silent fail
		}
	}

	return parsed;
};

const processResponse = async (request: SendRequest, options: SendOptions): Promise<UploadData> => {
	let state, response;

	try {
		const xhr = await request.pXhr;

		logger.debugLog("uploady.sender: received upload response ", xhr);

		state = ~SUCCESS_CODES.indexOf(xhr.status) ?
			FILE_STATES.FINISHED : FILE_STATES.ERROR;

		const resHeaders = getResponseHeaders(xhr);

		response = {
			data: parseResponseJson(xhr.response, resHeaders, options),
			headers: resHeaders,
		};
	} catch (ex) {
		if (request.aborted ){
			state = FILE_STATES.ABORTED;
			response = "aborted";
		}
		else {
			logger.debugLog("uploady.sender: upload failed: ", ex);
			state = FILE_STATES.ERROR;
			response = ex;
		}
	}

	return {
		state,
		response,
	};
};

const abortRequest = (request: SendRequest) => {
	let abortCalled = false;
	const { aborted, xhr } = request;

	if (!aborted && xhr.readyState && xhr.readyState !== 4) {
		logger.debugLog(`uploady.sender: cancelling request with ${request.count} items to: ${request.url}`);

		xhr.abort();
		request.aborted = true;
		abortCalled = true;
	}

	return abortCalled;
};

export default (items: BatchItem[], url: string, options: SendOptions, onProgress?: OnProgress): SendResult => {
	logger.debugLog("uploady.sender: sending file: ", { items, url, options, });

	const request = makeRequest(items, url, options, onProgress);

	return {
		request: processResponse(request, options),
		abort: () => abortRequest(request),
	};
};
