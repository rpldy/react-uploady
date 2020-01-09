// @flow
import { UPLOADER_EVENTS } from "@rpldy/uploader";
import {
	generateUploaderEventHook,
	generateUploaderEventHookWithState
} from "./utils";

import type { BatchItem } from "@rpldy/shared";

const useBatchStartListener = generateUploaderEventHook(UPLOADER_EVENTS.BATCH_START);
const useBatchFinishListener = generateUploaderEventHook(UPLOADER_EVENTS.BATCH_FINISH);
const useBatchCancelledListener = generateUploaderEventHook(UPLOADER_EVENTS.BATCH_CANCEL);

const useFileStartListener = generateUploaderEventHook(UPLOADER_EVENTS.ITEM_START);
const useFileFinishListener = generateUploaderEventHook(UPLOADER_EVENTS.ITEM_FINISH);
const useFileProgressListener = generateUploaderEventHookWithState(
	UPLOADER_EVENTS.ITEM_PROGRESS,
	(item: BatchItem) => ({ ...item }));

const useFileCancelListener = generateUploaderEventHook(UPLOADER_EVENTS.ITEM_CANCEL);
const useFileErrorListener = generateUploaderEventHook(UPLOADER_EVENTS.ITEM_ERROR);

export {
	useBatchStartListener,
	useBatchFinishListener,
	useBatchCancelledListener,

	useFileStartListener,
	useFileFinishListener,
	useFileProgressListener,
	useFileCancelListener,
	useFileErrorListener,
};