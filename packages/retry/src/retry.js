// @flow
import produce from "immer";
import { logger } from "@rpldy/shared";
import { UPLOADER_EVENTS } from "@rpldy/uploader";
import { RETRY_EXT, RETRY_EVENT } from "./consts";

import type { UploaderType, TriggerMethod } from "@rpldy/uploader";
import type { BatchItem, UploadOptions } from "@rpldy/shared";
import type { State, RetryState } from "./types";

const removeItemFromState = (state: RetryState, id: string) => {
    state.updateState((state: State) => {
        const batchId = state.failed[id].batchId;

        delete state.failed[id];
        const biMapIndex = state.batchIdsMap[batchId].indexOf(id);

        state.batchIdsMap[batchId].splice(biMapIndex, 1);

        if (!state.batchIdsMap[batchId].length) {
            delete state.batchIdsMap[batchId];
        }
    });
};

const uploadFailedIds = (uploader: UploaderType, state: RetryState, trigger: TriggerMethod, ids: ?string[], options: ?UploadOptions) => {
    const failed = state.getState().failed;

    ids = ids || Object.keys(failed);

    const uploads = ids.map((id) => failed[id] && (failed[id].file || failed[id].url))
        .filter(Boolean);

    if (uploads.length) {
        trigger(RETRY_EVENT, { items: uploads, options });
        ids.forEach((id) => removeItemFromState(state, id));
        uploader.add(uploads, options);
    }

    return !!uploads.length;
};

const retryItem = (uploader: UploaderType, state: RetryState, trigger: TriggerMethod, itemId: string, options: ?UploadOptions) => {
    logger.debugLog(`uploady.retry: about to retry item: ${itemId}`);
    return uploadFailedIds(uploader, state, trigger, [itemId], options);
};

const retry = (uploader: UploaderType, state: RetryState, trigger: TriggerMethod, itemId: ?string, options: ?UploadOptions) => {
    let result;

    if (itemId) {
        result = retryItem(uploader, state, trigger, itemId, options);
    } else {
        logger.debugLog(`uploady.retry: about to retry all failed item`);
        result = uploadFailedIds(uploader, state, trigger, null, options);
    }

    return result;
};

const retryBatch = (uploader: UploaderType, state: RetryState, trigger: TriggerMethod, batchId: string, options: ?UploadOptions) => {
    logger.debugLog(`uploady.retry: about to retry batch: ${batchId}`);

    const batchItemIds = state.getState().batchIdsMap[batchId];

    return batchItemIds ?
        uploadFailedIds(uploader, state, trigger, batchItemIds, options) :
        false;
};

const createRetryState = (): RetryState => {
    let retryState = {
        batchIdsMap: {},
        failed: {},
    };

    return {
        updateState: (updater: (State) => void) => {
            retryState = produce(retryState, updater);
        },
        getState: () => retryState,
    };
};

const registerEvents = (uploader: UploaderType, state: RetryState) => {
    const onItemFail = (item: BatchItem) => {
        state.updateState((state: State) => {
            state.failed[item.id] = item;
            const biMap = state.batchIdsMap[item.batchId] = state.batchIdsMap[item.batchId] || [];
            biMap.push(item.id);
        });
    };

    uploader.on(UPLOADER_EVENTS.ITEM_CANCEL, onItemFail);
    uploader.on(UPLOADER_EVENTS.ITEM_ERROR, onItemFail);
};

/**
 * an uploader enhancer function to add retry functionality
 */
export default (uploader: UploaderType, trigger: TriggerMethod): UploaderType => {
    const state = createRetryState();

    registerEvents(uploader, state);

    uploader.registerExtension(RETRY_EXT, {
        retry: (itemId?: string, options?: UploadOptions) =>
            retry(uploader, state, trigger, itemId, options),
        retryBatch: (batchId: string, options?: UploadOptions) =>
            retryBatch(uploader, state, trigger, batchId, options),
    });

    return uploader;
};


