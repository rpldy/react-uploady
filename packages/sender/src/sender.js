// @flow

//TODO: need to support grouping of files into single request

import { logger, FILE_STATES } from "@rupy/shared";

import type {
	SendOptions,
		FileState,
		BatchItem,
		SendResult,
		UploadData,
		OnProgress,
} from "@rupy/shared";

type Headers = { [string]: string };

const SUCCESS_CODES = [200, 201, 202, 203, 204];

const setHeaders = (req, options: SendOptions) => {

	//TODO: Content-Range
	//TODO: 'Content-Disposition' = 'attachment; filename="' +  encodeURI(file.name)+ '"'
	//'application/octet-stream'

	//cld cors allowed headers =  Cache-Control, Content-Disposition, Content-MD5, Content-Range, Content-Type, DPR, Viewport-Width, X-CSRF-Token, X-Prototype-Version, X-Requested-With, X-Unique-Upload-Id
	const headers = {
		// "Content-Type": options.encoding,
		...(options.headers || {}),
	};

	Object.keys(headers).forEach((name) =>
		req.setRequestHeader(name, headers[name]));
};

const getFormData = (item: BatchItem, options: SendOptions) => {
	const fd = new FormData(),
		fileName = item.file ? item.file.name : undefined;

	if (item.file) {
		fd.set(options.paramName, item.file, fileName);
	} else if (item.url) {
		fd.set(options.paramName, item.url);
	}

	Object.entries(options.params)
		.forEach(([key, val]: [string, any]) => fd.set(key, val));

	return fd;
};

const makeRequest = (item: BatchItem, url: string, options: SendOptions, onProgress: OnProgress): { pXhr: Promise<XMLHttpRequest>, xhr: XMLHttpRequest } => {
	const req = new XMLHttpRequest();

	const pXhr = new Promise((resolve, reject) => {

		const formData = getFormData(item, options);

		req.onerror = () => reject(req);
		req.ontimeout = () => reject(req);
		req.onload = () => resolve(req);

		req.upload.onprogress = (e) => {
			if (e.lengthComputable) {
				onProgress(e);
			}
		};

		req.open(options.method, url);

		setHeaders(req, options);

		if (options.withCredentials) {
			req.withCredentials = true;
		}

		req.send(formData);
	});

	return {
		pXhr,
		xhr: req,
	};
};

const getResponseHeaders = (xhr: XMLHttpRequest): ?Headers => {
	let resHeaders;

	try {
		resHeaders = xhr.getAllResponseHeaders().trim()
			.split(/[\r\n]+/)
			.reduce((res, line: string) => {
				const [key, val] = line.split(': ');
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

	if (options.forceJsonResponse || ct && ~ct.indexOf("json")) {
		try {
			parsed = JSON.parse(response);
		} catch (e) { //silent fail
		}
	}

	return parsed;
};

const processResponse = async (pXhr: Promise<XMLHttpRequest>, options: SendOptions): Promise<UploadData> => {
	let state, response;

	try {
		const xhr = await pXhr;

		logger.debugLog("uploady.sender: received upload response ", xhr);

		state = ~SUCCESS_CODES.indexOf(xhr.status) ?
			FILE_STATES.FINISHED : FILE_STATES.ERROR;

		const resHeaders = getResponseHeaders(xhr);

		response = {
			data: parseResponseJson(xhr.response, resHeaders, options),
			headers: resHeaders,
		};
	} catch (ex) {
		logger.debugLog("uploady.sender: upload failed: ", ex);
		state = FILE_STATES.ERROR;
		response = ex;
	}

	return {
		state,
		response,
	};
};

export default (item: BatchItem, url: string, options: SendOptions, onProgress: OnProgress): SendResult => {
	logger.debugLog("uploady.sender: sending file: ", { item, url, options, });

	const request = makeRequest(item, url, options, onProgress);

	return {
		request: processResponse(request.pXhr, options),
		abort: () => request.xhr.abort(),
	};
};