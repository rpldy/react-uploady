// @flow
import { isFunction, logger, throttle } from "@rpldy/shared";
import addLife from "@rpldy/life-events";
//TODO (v2): Load using enhancer to allow using uploader (tree-shake) that doesnt import the defualt sender if not needed
import defaultSend from "@rpldy/sender";
import { PROGRESS_DELAY, SENDER_EVENTS } from "./consts";
import { DEFAULT_OPTIONS, DEFAULT_PARAM_NAME } from "./defaults";

import type { Batch, BatchItem } from "@rpldy/shared";
import type { TriggerMethod } from "@rpldy/life-events";
import type { ItemsSender, UploaderCreateOptions, BatchItemSenderSendMethod } from "./types";

const reportItemsProgress = (items: BatchItem[], completed: number, loaded: number, total: number, trigger: TriggerMethod) => {
    items.forEach((item: BatchItem) => {
        logger.debugLog(`uploady.uploader.processor: file: ${item.id} progress event: loaded(${loaded}) - completed(${completed})`);

        trigger(SENDER_EVENTS.ITEM_PROGRESS,
            item,
            completed,
            loaded,
            total);
    });
};

const onItemUploadProgress = (items: BatchItem[], batch: Batch, e: ProgressEvent, trigger: TriggerMethod) => {
    const completed = Math.min(((e.loaded / e.total) * 100), 100),
        //average the bytes loaded across the files in the group
        completedPerItem = completed / items.length,
        //average the percentage across the files in the group
        loadedAverage = e.loaded / items.length;

    reportItemsProgress(items, completedPerItem, loadedAverage, e.total, trigger);

    trigger(SENDER_EVENTS.BATCH_PROGRESS, batch);
};

const createBatchItemsSender = (): ItemsSender => {
    const send: BatchItemSenderSendMethod = (items: BatchItem[], batch: Batch, batchOptions: UploaderCreateOptions) => {
        const destination = batchOptions.destination,
            url = destination?.url;

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
            formatServerResponse: batchOptions.formatServerResponse,
            formDataAllowUndefined: batchOptions.formDataAllowUndefined,
            isSuccessfulCall: batchOptions.isSuccessfulCall,
        }, throttledProgress);
    };

    const { trigger, target: sender } = addLife({ send }, Object.values(SENDER_EVENTS));

    return sender;
};

export default createBatchItemsSender;
