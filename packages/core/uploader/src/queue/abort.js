// @flow
import { BATCH_STATES, FILE_STATES, logger } from "@rpldy/shared";
import { UPLOADER_EVENTS } from "../consts";
import {
    triggerUploaderBatchEvent,
    getBatchFromState,
} from "./batchHelpers";
import processFinishedRequest from "./processFinishedRequest";

import type { ProcessNextMethod, QueueState, State } from "./types";
import type { BatchItem, FileState } from "@rpldy/shared";

const isPendingItem = (state: State, itemId: string) => {





};

const isItemInProgress = (fileState: FileState): boolean =>
    fileState === FILE_STATES.ADDED ||
    fileState === FILE_STATES.UPLOADING;

const removePendingItem = (queue, item, next) => {
    //manually finish request for added item that hasnt reached the sender yet
    processFinishedRequest(queue, [{
        id: item.id,
        info: { status: 0, state: FILE_STATES.ABORTED, response: "aborted" },
    }], next);

    return true;
};

const abortItemInProgress = (queue:  QueueState, state: State, item: BatchItem, next) => {
    let abortCalled;

    if (item.state === FILE_STATES.UPLOADING) {
        queue.updateState((state) => {
            state.items[item.id].state = FILE_STATES.ABORTED;
        });

        abortCalled = state.aborts[item.id]();
    } else {
      abortCalled = removePendingItem(queue, item, next);
        // processFinishedRequest(queue, [{
        //     id: item.id,
        //     info: { status: 0, state: FILE_STATES.ABORTED, response: "aborted" },
        // }], next);
        //
        // abortCalled = true;
    }

    return abortCalled;
};

const callAbortOnItem = (queue: QueueState, id: string, next: ProcessNextMethod) => {
    let abortCalled = false;

    const state = queue.getState(),
        item = state.items[id];

    if (item && isItemInProgress(item.state)) {
        logger.debugLog(`uploader.queue: aborting item in progress - `, item);
        abortCalled = abortItemInProgress(queue, state, item, next);
    } else if (isPendingItem(state, id)) {
        logger.debugLog(`uploader.queue: aborting item from pending batch - `, item);
        abortCalled = removePendingItem(queue, item, next);
    }

	return abortCalled;
};

const abortAll = (queue: QueueState, next: ProcessNextMethod) => {
	const items = queue.getState().items;

	Object.keys(items)
		.forEach((id) => callAbortOnItem(queue, id, next));

	queue.trigger(UPLOADER_EVENTS.ALL_ABORT);
};

const abortItem = (queue: QueueState, id: string, next: ProcessNextMethod): boolean => {
	return callAbortOnItem(queue, id, next);
};

const abortBatch = (queue: QueueState, id: string, next: ProcessNextMethod): void => {
	const state = queue.getState(),
		batchData = state.batches[id],
		batch = batchData?.batch;

	if (batch && batch.state !== BATCH_STATES.CANCELLED
		&& batch.state !== BATCH_STATES.FINISHED) {

		batch.items.forEach((bi) =>
			callAbortOnItem(queue, bi.id, next));

		queue.updateState((state) => {
			getBatchFromState(state, id).state = BATCH_STATES.ABORTED;
		});

		triggerUploaderBatchEvent(queue, id, UPLOADER_EVENTS.BATCH_ABORT);
	}
};

export {
	abortAll,
	abortItem,
	abortBatch,
};
