// @flow
import { UPLOADER_EVENTS } from "@rupy/uploader";
import {
	generateUploaderEventHook,
	generateUploaderEventHookWithState} from "./utils";
import type { BatchItem } from "@rupy/uploader";

const useBatchStartListeneer = generateUploaderEventHook(UPLOADER_EVENTS.BATCH_START);
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
	useBatchStartListeneer,
	useBatchFinishListener,
	useBatchCancelledListener,

	useFileStartListener,
	useFileFinishListener,
	useFileProgressListener,
	useFileCancelListener,
	useFileErrorListener,
};