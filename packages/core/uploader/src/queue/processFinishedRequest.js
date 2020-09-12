// @flow
import { FILE_STATES, logger } from "@rpldy/shared";
import { UPLOADER_EVENTS } from "../consts";
import { cleanUpFinishedBatch } from "./batchHelpers";

import type { UploadData, BatchItem } from "@rpldy/shared";
import type { ProcessNextMethod, QueueState } from "./types";

export const FILE_STATE_TO_EVENT_MAP = {
    [FILE_STATES.ADDED]: UPLOADER_EVENTS.ITEM_START,
    [FILE_STATES.FINISHED]: UPLOADER_EVENTS.ITEM_FINISH,
    [FILE_STATES.ERROR]: UPLOADER_EVENTS.ITEM_ERROR,
    [FILE_STATES.CANCELLED]: UPLOADER_EVENTS.ITEM_CANCEL,
    [FILE_STATES.ABORTED]: UPLOADER_EVENTS.ITEM_ABORT,
    [FILE_STATES.UPLOADING]: UPLOADER_EVENTS.ITEM_PROGRESS,
};

const ITEM_FINALIZE_STATES = [
  FILE_STATES.FINISHED,
  FILE_STATES.ERROR,
  FILE_STATES.CANCELLED,
  FILE_STATES.ABORTED
];

type FinishData = { id: string, info: UploadData };

const getIsFinalized = (item: BatchItem) =>
	!!~ITEM_FINALIZE_STATES.indexOf(item.state);

export default (queue: QueueState, finishedData: FinishData[], next: ProcessNextMethod) => {
    finishedData.forEach((itemData: FinishData) => {
        const state = queue.getState();
        const { id, info } = itemData;

        logger.debugLog("uploader.processor.queue: request finished for item - ", { id, info });

        if (state.items[id]) {
            queue.updateState((state) => {
                const item = state.items[id];
                item.state = info.state;
                item.uploadResponse = info.response;

                if (getIsFinalized(item)) {
					delete state.aborts[id];
				}
            });

            //get most up-to-date item data
            const item = queue.getState().items[id];

            if (info.state === FILE_STATES.FINISHED && item.completed < 100) {
                //ensure we trigger progress event with completed = 100 for all items
                queue.handleItemProgress(item, 100, item.file ? item.file.size : 0);
            }

            //trigger UPLOADER EVENT for item based on its state
            queue.trigger(FILE_STATE_TO_EVENT_MAP[item.state], item);

            if (getIsFinalized(item)) {
                //trigger FINALIZE event
                queue.trigger(UPLOADER_EVENTS.ITEM_FINALIZE, item);
            }
        }

        const index = state.itemQueue.indexOf(id);

        if (~index) {
            queue.updateState((state) => {
                state.itemQueue.splice(index, 1);
                const activeIndex = state.activeIds.indexOf(id);

                if (~activeIndex) {
                    state.activeIds.splice(activeIndex, 1);
                }
            });
        }
    });

    cleanUpFinishedBatch(queue);

    return next(queue);
};
