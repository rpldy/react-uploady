// @flow
import { FILE_STATES, logger } from "@rpldy/shared";
// import {

// import processFinishedRequest from "./processFinishedRequest";

import type { Batch, BatchItem, UploadOptions } from "@rpldy/shared";
// import type { ProcessNextMethod, QueueState } from "./types";
// import type { UploaderType } from "@rpldy/uploader";
// import { ABORT_EXT } from "./consts";
import type { AbortResult, AbortsMap, FinalizeRequestMethod } from "./types";
import { fastAbortAll, fastAbortBatch } from "./fastAbort";
// import type { CreateOptions } from "@rpldy/uploader/src";

// const abortNonUploadingItem = (queue, item: BatchItem, next: ProcessNextMethod) => {
//     logger.debugLog(`uploader.queue: aborting ${item.state} item  - `, item);
//
//     //manually finish request for item that hasnt reached the sender yet
//     processFinishedRequest(queue, [{
//         id: item.id,
//         info: { status: 0, state: FILE_STATES.ABORTED, response: "aborted" },
//     }], next);
//
//     return true;
// };

const abortNonUploadingItem = (item, aborts, finalizeItem) => {
    logger.debugLog(`abort: aborting ${item.state} item  - `, item);

    //manually finish request for item that hasnt reached the sender yet
    finalizeItem(item.id, { status: 0, state: FILE_STATES.ABORTED, response: "aborted" });

    return true;
};

const ITEM_STATE_ABORTS = {
    [FILE_STATES.UPLOADING]: (item, aborts) => {
        logger.debugLog(`abort: aborting uploading item  - `, item);
        return aborts[item.id]();
    },
    [FILE_STATES.ADDED]: abortNonUploadingItem,
    [FILE_STATES.PENDING]: abortNonUploadingItem,
};

const callAbortOnItem = (
    item: BatchItem,
    aborts: AbortsMap,
    finalizeItem: FinalizeRequestMethod
) : boolean => {
    const itemState = item?.state;

    return !!itemState &&
    ITEM_STATE_ABORTS[itemState] ?
        //$FlowExpectedError[extra-arg]
        //$FlowIssue[prop-missing]
        ITEM_STATE_ABORTS[itemState](item, aborts, finalizeItem) : false;
};

const abortItem = (
    id: string,
    items:  { [string]: BatchItem },
    aborts: AbortsMap,
    finalizeItem: FinalizeRequestMethod
) : boolean => callAbortOnItem(items[id], aborts, finalizeItem);
// const abortItem = (queue: QueueState, id: string, next: ProcessNextMethod): boolean =>
//     callAbortOnItem(queue, id, next);
// const callAbortOnItem = (queue: QueueState, id: string, next: ProcessNextMethod) => {
//     const state = queue.getState(),
//         item = state.items[id],
//         itemState = item?.state;
//
//     //$FlowIssue[prop-missing]
//     return ITEM_STATE_ABORTS[itemState] ?
//         //$FlowExpectedError[extra-arg]
//         //$FlowIssue[prop-missing]
//         ITEM_STATE_ABORTS[itemState](queue, item, next) : false;
// };

const getIsFastAbortNeeded = (count, threshold: ?number) => {
    let result = false;

    if (threshold !== 0 && threshold) {
        result = count >= threshold;
    }

    return result;
};

const abortAll = (
    items:  { [string]: BatchItem },
    aborts: AbortsMap,
    finalizeItem: FinalizeRequestMethod,
    options: UploadOptions
) : AbortResult => {
    const itemIds = Object.keys(items);

    const isFastAbort = getIsFastAbortNeeded(itemIds.length, options.fastAbortThreshold);

    if (isFastAbort) {
        logger.debugLog(`abort: using fast abort for abort-all`);
        fastAbortAll(aborts);
    } else {
        itemIds.forEach((id) =>
                abortItem(id, items, aborts, finalizeItem));
    }

    return { isFast: isFastAbort };
//TODO: Uploader should  trigger once all items are actually finalized? ask from smugmug
// queue.trigger(UPLOADER_EVENTS.ALL_ABORT);
};

const abortBatch = (
    batch: Batch,
    batchOptions: UploadOptions,
    aborts: AbortsMap,
    finalizeItem: FinalizeRequestMethod,
    options: UploadOptions,
) : AbortResult => {
    const threshold = batchOptions.fastAbortThreshold === 0 ? 0 :
        (batchOptions.fastAbortThreshold || options.fastAbortThreshold);

    const isFastAbort = getIsFastAbortNeeded(batch.items.length, threshold);

    if (isFastAbort) {
        logger.debugLog(`abort: using fast abort for abort-batch (${batch.id})`);
        fastAbortBatch(batch, aborts);
    } else {
        batch.items.forEach((bi) => callAbortOnItem(bi, aborts, finalizeItem));
    }

    return { isFast: isFastAbort };
};

export {
    abortAll,
    abortBatch,
    abortItem,
};
