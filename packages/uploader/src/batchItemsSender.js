// @flow
import { throttle } from "lodash";
import { isFunction, logger } from "@rpldy/shared";
import addLife from "@rpldy/life-events";
import defaultSend from "@rpldy/sender";
import { PROGRESS_DELAY, SENDER_EVENTS } from "./consts";
import { DEFAULT_OPTIONS, DEFAULT_PARAM_NAME } from "./defaults";

import type { BatchItem, CreateOptions } from "@rpldy/shared";
import type { ItemsSender } from "./types";

const onItemUploadProgress = (items: BatchItem[], e: ProgressEvent, trigger) => {
	const completed = (e.loaded / e.total) * 100,
		completedPerItem = completed / items.length,
		loadedPerItem = e.loaded / items.length;

	items.forEach((item: BatchItem) => {
		logger.debugLog(`uploady.uploader.processor: file: ${item.id} progress event: loaded(${loadedPerItem}) - completed(${completedPerItem})`);
		trigger(SENDER_EVENTS.PROGRESS, {
			item,
			completed: completedPerItem,
			loaded: loadedPerItem
		});
	});
};

export default (): ItemsSender => {
	const send = (items: BatchItem[], batchOptions: CreateOptions) => {
		const destination = batchOptions.destination,
			url = destination && destination.url,
			paramName = destination && destination.filesParamName;

		if (!url) {
			throw new Error("Destination URL not found! Can't send files without it");
		}

		const throttledProgress = throttle(
			(e: ProgressEvent) => onItemUploadProgress(items, e, trigger), PROGRESS_DELAY);

		const send = isFunction(batchOptions.send) ? batchOptions.send : defaultSend;

		return send(items, url, {
			method: batchOptions.method || DEFAULT_OPTIONS.method,
			paramName: paramName || batchOptions.inputFieldName || DEFAULT_PARAM_NAME,
			params: { //TODO: might need to rethink the order here:
				...batchOptions.params,
				...(destination && destination.params),
			},
			forceJsonResponse: batchOptions.forceJsonResponse,
			withCredentials: batchOptions.withCredentials,
			formatGroupParamName: batchOptions.formatGroupParamName,
		}, throttledProgress);
	};

	const { trigger, target: sender } = addLife({ send }, Object.values(SENDER_EVENTS));

	return sender;
};
