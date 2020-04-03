// @flow
import produce from "immer";
import { logger, triggerCancellable } from "@rpldy/shared";
import { UPLOADER_EVENTS } from "@rpldy/uploader";

import type { UploaderType } from "@rpldy/uploader";
import type { BatchItem, Cancellable } from "@rpldy/shared";
import type { State, RetryState } from "./types";


const retry = (uploader: UploaderType, state: RetryState, cancellable: Cancellable, itemId: string) => {

    logger.debugLog(`uploady.retry: about to retry item: ${itemId}`);


};

const retryBatch = (uploader: UploaderType, state: RetryState, cancellable: Cancellable, batchId: string) => {

    logger.debugLog(`uploady.retry: about to retry batch: ${batchId}`);


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
export default (uploader: UploaderType, trigger): UploaderType => {
    const cancellable = triggerCancellable(trigger);
    const state = createRetryState();

    registerEvents(uploader, state);

    uploader.registerExtension("retry", {
        retry: () => retry(uploader, state, cancellable),
        retryBatch: () => retryBatch(uploader, state, cancellable),
    });

    return uploader;
};


