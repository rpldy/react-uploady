// @flow
import { isFunction, logger, throttle } from "@rpldy/shared";
import addLife from "@rpldy/life-events";
import defaultSend from "@rpldy/sender";
import { PROGRESS_DELAY, SENDER_EVENTS } from "./consts";
import { DEFAULT_OPTIONS, DEFAULT_PARAM_NAME } from "./defaults";

import type { Batch, BatchItem } from "@rpldy/shared";
import type { ItemsSender, CreateOptions } from "./types";

const reportItemsProgress = (items: BatchItem[], completed: number, loaded: number, trigger) => {
    items.forEach((item: BatchItem) => {
        logger.debugLog(`uploady.uploader.processor: file: ${item.id} progress event: loaded(${loaded}) - completed(${completed})`);

        trigger(SENDER_EVENTS.ITEM_PROGRESS,
            item,
            completed,
            loaded);
    });
};

const onItemUploadProgress = (items: BatchItem[], batch: Batch, e: ProgressEvent, trigger) => {
    const completed = Math.min(((e.loaded / e.total) * 100), 100),
        completedPerItem = completed / items.length,
        loadedAverage = e.loaded / items.length;

    reportItemsProgress(items, completedPerItem, loadedAverage, trigger);

    trigger(SENDER_EVENTS.BATCH_PROGRESS, batch);
};

export default (): ItemsSender => {
    const send = (items: BatchItem[], batch: Batch, batchOptions: CreateOptions) => {
        const destination = batchOptions.destination,
            url = destination?.url;

        if (!url) {
            throw new Error("Destination URL not found! Can't send files without it");
        }

        const throttledProgress = throttle(
            (e: ProgressEvent) => onItemUploadProgress(items, batch, e, trigger), PROGRESS_DELAY, true);

        const send = isFunction(batchOptions.send) ? batchOptions.send : defaultSend;

        return send(items, url, {
            method: destination?.method || batchOptions.method || DEFAULT_OPTIONS.method,
            paramName: destination?.filesParamName || batchOptions.inputFieldName || DEFAULT_PARAM_NAME,
            params: { //TODO: might need to rethink the order here:
                ...batchOptions.params,
                ...destination?.params,
            },
            forceJsonResponse: batchOptions.forceJsonResponse,
            withCredentials: batchOptions.withCredentials,
            formatGroupParamName: batchOptions.formatGroupParamName,
            headers: destination?.headers,
			sendWithFormData: batchOptions.sendWithFormData,
        }, throttledProgress);
    };

    const { trigger, target: sender } = addLife({ send }, Object.values(SENDER_EVENTS));

    return sender;
};
