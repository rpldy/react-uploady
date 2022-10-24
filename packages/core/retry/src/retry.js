// @flow
import { FILE_STATES, logger } from "@rpldy/shared";
import createState from "@rpldy/simple-state";
import { UPLOADER_EVENTS } from "@rpldy/uploader";
import { RETRY_EXT, RETRY_EVENT } from "./consts";

import type { UploaderType, UploaderCreateOptions, TriggerMethod } from "@rpldy/uploader";
import type { BatchItem, UploadOptions } from "@rpldy/shared";
import type { State, RetryState } from "./types";

const FAILED_STATES = [FILE_STATES.ABORTED, FILE_STATES.ERROR];

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

const uploadFailedIds = (
    uploader: UploaderType<UploaderCreateOptions>,
    retryState: RetryState,
    trigger: TriggerMethod,
    ids: ?string[],
    options: ?UploadOptions
) => {
    const failed = retryState.getState().failed;

    ids = ids || Object.keys(failed);

    const uploads: BatchItem[] = ids.map((id) => failed[id])
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

const retryItem = (
    uploader: UploaderType<UploaderCreateOptions>,
    retryState: RetryState,
    trigger: TriggerMethod,
    itemId: string,
    options: ?UploadOptions
) : boolean => {
    logger.debugLog(`uploady.retry: about to retry item: ${itemId}`);
    return uploadFailedIds(uploader, retryState, trigger, [itemId], options);
};

const retry = (
    uploader: UploaderType<UploaderCreateOptions>,
    retryState: RetryState,
    trigger: TriggerMethod,
    itemId: ?string,
    options: ?UploadOptions
) : boolean => {
    let result;

    if (itemId) {
        result = retryItem(uploader, retryState, trigger, itemId, options);
    } else {
        logger.debugLog(`uploady.retry: about to retry all failed item`);
        result = uploadFailedIds(uploader, retryState, trigger, null, options);
    }

    return result;
};

const retryBatch = (
    uploader: UploaderType<UploaderCreateOptions>,
    retryState: RetryState,
    trigger: TriggerMethod,
    batchId: string,
    options: ?UploadOptions
) : boolean => {
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

const registerEvents = (uploader: UploaderType<UploaderCreateOptions>, retryState: RetryState) => {
    const onItemFinalized = (item: BatchItem) => {
        if (FAILED_STATES.includes(item.state)) {
            retryState.updateState((state: State) => {
                state.failed[item.id] = item;
                const biMap = state.batchIdsMap[item.batchId] = state.batchIdsMap[item.batchId] || [];
                biMap.push(item.id);
            });
        }
    };

    uploader.on(UPLOADER_EVENTS.ITEM_FINALIZE, onItemFinalized);
};

/**
 * an uploader enhancer function to add retry functionality
 */
const retryEnhancer = (uploader: UploaderType<UploaderCreateOptions>, trigger: TriggerMethod): UploaderType<UploaderCreateOptions> => {
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

export default retryEnhancer;
