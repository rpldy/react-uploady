// @flow
import { logger } from "@rpldy/shared";
import createState from "@rpldy/simple-state";
import { UPLOADER_EVENTS } from "@rpldy/uploader";
import { RETRY_EXT, RETRY_EVENT } from "./consts";

import type { UploaderType, TriggerMethod } from "@rpldy/uploader";
import type { BatchItem, UploadOptions } from "@rpldy/shared";
import type { State, RetryState } from "./types";

const removeItemFromState = (retryState: RetryState, id: string) => {
    retryState.updateState((state: State) => {
        const batchId = state.failed[id].batchId;

        delete state.failed[id];
        const biMapIndex = state.batchIdsMap[batchId].indexOf(id);

        state.batchIdsMap[batchId].splice(biMapIndex, 1);

        if (!state.batchIdsMap[batchId].length) {
            delete state.batchIdsMap[batchId];
        }
    });
};

const uploadFailedIds = (uploader: UploaderType, retryState: RetryState, trigger: TriggerMethod, ids: ?string[], options: ?UploadOptions) => {
    const failed = retryState.getState().failed;

    ids = ids || Object.keys(failed);

    const uploads = ids.map((id) => failed[id])
        .filter(Boolean);

    if (uploads.length) {
		options = {
			...(options || null),
			autoUpload: typeof options?.autoUpload !== "undefined" ? options.autoUpload : true,
		};

		trigger(RETRY_EVENT, { items: uploads, options });
		ids.forEach((id) => removeItemFromState(retryState, id));
		uploader.add(uploads, options);
	}

    return !!uploads.length;
};

const retryItem = (uploader: UploaderType, retryState: RetryState, trigger: TriggerMethod, itemId: string, options: ?UploadOptions) => {
    logger.debugLog(`uploady.retry: about to retry item: ${itemId}`);
    return uploadFailedIds(uploader, retryState, trigger, [itemId], options);
};

const retry = (uploader: UploaderType, retryState: RetryState, trigger: TriggerMethod, itemId: ?string, options: ?UploadOptions) => {
    let result;

    if (itemId) {
        result = retryItem(uploader, retryState, trigger, itemId, options);
    } else {
        logger.debugLog(`uploady.retry: about to retry all failed item`);
        result = uploadFailedIds(uploader, retryState, trigger, null, options);
    }

    return result;
};

const retryBatch = (uploader: UploaderType, retryState: RetryState, trigger: TriggerMethod, batchId: string, options: ?UploadOptions) => {
    logger.debugLog(`uploady.retry: about to retry batch: ${batchId}`);

    //we make a copy of the ids because later on we use splice on this array
    const batchItemIds = retryState.getState().batchIdsMap[batchId]?.slice();

    return batchItemIds ?
        uploadFailedIds(uploader, retryState, trigger, batchItemIds, options) :
        false;
};

const createRetryState = (): RetryState => {
    const { state, update } = createState<State>({
        batchIdsMap: {},
        failed: {},
    });

    return {
        updateState: (updater: (State) => void) => {
            update(updater);
        },
        getState: () => state,
    };
};

const registerEvents = (uploader: UploaderType, retryState: RetryState) => {
    const onItemFail = (item: BatchItem) => {
        retryState.updateState((state: State) => {
            state.failed[item.id] = item;
            const biMap = state.batchIdsMap[item.batchId] = state.batchIdsMap[item.batchId] || [];
            biMap.push(item.id);
        });
    };

    uploader.on(UPLOADER_EVENTS.ITEM_ERROR, onItemFail);
    uploader.on(UPLOADER_EVENTS.ITEM_ABORT, onItemFail);
};

/**
 * an uploader enhancer function to add retry functionality
 */
export default (uploader: UploaderType, trigger: TriggerMethod): UploaderType => {
    const retryState = createRetryState();

    registerEvents(uploader, retryState);

    uploader.registerExtension(RETRY_EXT, {
        retry: (itemId?: string, options?: UploadOptions) =>
            retry(uploader, retryState, trigger, itemId, options),
        retryBatch: (batchId: string, options?: UploadOptions) =>
            retryBatch(uploader, retryState, trigger, batchId, options),
    });

    return uploader;
};
