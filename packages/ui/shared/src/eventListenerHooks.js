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
const useBatchAbortListener = generateUploaderEventHook(UPLOADER_EVENTS.BATCH_ABORT);

const useFileStartListener = generateUploaderEventHook(UPLOADER_EVENTS.ITEM_START);
const useFileFinishListener = generateUploaderEventHook(UPLOADER_EVENTS.ITEM_FINISH);
const useFileProgressListener = generateUploaderEventHookWithState(
	UPLOADER_EVENTS.ITEM_PROGRESS,
	(item: BatchItem) => ({ ...item }));

const useFileCancelListener = generateUploaderEventHook(UPLOADER_EVENTS.ITEM_CANCEL);
const useFileErrorListener = generateUploaderEventHook(UPLOADER_EVENTS.ITEM_ERROR);

const useRequestPreSend = generateUploaderEventHook(UPLOADER_EVENTS.REQUEST_PRE_SEND);

export {
	useBatchStartListener,
	useBatchFinishListener,
	useBatchCancelledListener,
	useBatchAbortListener,

	useFileStartListener,
	useFileFinishListener,
	useFileProgressListener,
	useFileCancelListener,
	useFileErrorListener,

	useRequestPreSend,
};