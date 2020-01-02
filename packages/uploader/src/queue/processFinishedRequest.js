// @flow

import { FILE_STATES, logger } from "@rpldy/shared";
import { UPLOADER_EVENTS } from "../consts";
import { cleanUpFinishedBatch } from "./batchHelpers";

import type { UploadData } from "@rpldy/shared";
import type { ProcessNextMethod, QueueState } from "./types";

const FILE_STATE_TO_EVENT_MAP = {
	[FILE_STATES.FINISHED]: UPLOADER_EVENTS.FILE_FINISH,
	[FILE_STATES.ERROR]: UPLOADER_EVENTS.FILE_ERROR,
	[FILE_STATES.CANCELLED]: UPLOADER_EVENTS.FILE_CANCEL,
};

type FinishData = { id: string, info: UploadData };

export default (queue: QueueState, finishedData: FinishData[], next: ProcessNextMethod) => {
	finishedData.forEach((itemData: FinishData) => {
		const state = queue.getState();
		const { id, info } = itemData;

		logger.debugLog("uploady.uploader.processor.queue: request finished - ", { id, info });

		if (state.items[id]) {
			queue.updateState((state)=>{
				const item = state.items[id];
				item.state = info.state;
				item.uploadResponse = info.response;
			});

			const item = state.items[id];
			queue.trigger(FILE_STATE_TO_EVENT_MAP[item.state], item);
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