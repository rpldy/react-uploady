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

const useFileStartListener = generateUploaderEventHook(UPLOADER_EVENTS.FILE_START);
const useFileFinishListener = generateUploaderEventHook(UPLOADER_EVENTS.FILE_FINISH);
const useFileProgressListener = generateUploaderEventHookWithState(
	UPLOADER_EVENTS.FILE_PROGRESS,
	(item: BatchItem) => item);

const useFileCancelListener = generateUploaderEventHook(UPLOADER_EVENTS.FILE_CANCEL);
const useFileErrorListener = generateUploaderEventHook(UPLOADER_EVENTS.FILE_ERROR);

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