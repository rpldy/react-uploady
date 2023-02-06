// @flow
import { FILE_STATES, logger } from "@rpldy/shared";
import { fastAbortAll, fastAbortBatch } from "./fastAbort";

import type { Batch, BatchItem, UploadOptions } from "@rpldy/shared";
import type { AbortResult, AbortsMap, ItemsQueue, FinalizeRequestMethod } from "./types";

const abortNonUploadingItem = (item: BatchItem, aborts: AbortsMap, finalizeItem: FinalizeRequestMethod) => {
    logger.debugLog(`abort: aborting ${item.state} item  - `, item);

    //manually finish request for item that hasnt reached the sender yet
    finalizeItem(item.id, { status: 0, state: FILE_STATES.ABORTED, response: "aborted" });

    return true;
};

const ITEM_STATE_ABORTS = {
    [FILE_STATES.UPLOADING]: (item: BatchItem, aborts: AbortsMap) => {
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
    //$FlowIssue[prop-missing]
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

const getIsFastAbortNeeded = (count: number, threshold: ?number) => {
    let result = false;

    if (threshold !== 0 && threshold) {
        result = count >= threshold;
    }

    return result;
};

const abortAll = (
    items:  { [string]: BatchItem },
    aborts: AbortsMap,
    queue: ItemsQueue,
    finalizeItem: FinalizeRequestMethod,
    options: UploadOptions
) : AbortResult => {
    //$FlowIssue[incompatible-type] - no flat
    const itemIds : string[] = Object
        .values(queue)
        .flat();

    const isFastAbort = getIsFastAbortNeeded(itemIds.length, options.fastAbortThreshold);

    logger.debugLog(`abort: doing abort-all (${isFastAbort ? "fast" : "normal"} abort)`);

    if (isFastAbort) {
        fastAbortAll(aborts);
    } else {
        itemIds.forEach((id) =>
                abortItem(id, items, aborts, finalizeItem));
    }

    return { isFast: isFastAbort };
};

const abortBatch = (
    batch: Batch,
    batchOptions: UploadOptions,
    aborts: AbortsMap,
    queue: ItemsQueue,
    finalizeItem: FinalizeRequestMethod,
    options: UploadOptions,
) : AbortResult => {
    const threshold = batchOptions.fastAbortThreshold === 0 ? 0 :
        (batchOptions.fastAbortThreshold || options.fastAbortThreshold);

    const isFastAbort = getIsFastAbortNeeded(queue[batch.id].length, threshold);

    logger.debugLog(`abort: doing abort-batch on: ${batch.id} (${isFastAbort ? "fast" : "normal"} abort)`);

    if (isFastAbort) {
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
