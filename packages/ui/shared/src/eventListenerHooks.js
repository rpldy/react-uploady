// @flow
// import { useEffect, useContext } from "React";
import { UPLOADER_EVENTS } from "@rupy/uploader";
import { generateUploaderEventHook } from "./utils";

const useBatchStartListeneer = generateUploaderEventHook(UPLOADER_EVENTS.BATCH_START);
const useBatchFinishListener = generateUploaderEventHook(UPLOADER_EVENTS.BATCH_FINISH);
const useBatchCancelledListener = generateUploaderEventHook(UPLOADER_EVENTS.BATCH_CANCEL);

const useFileStartListener = generateUploaderEventHook(UPLOADER_EVENTS.FILE_START);
const useFileFinishListener = generateUploaderEventHook(UPLOADER_EVENTS.FILE_FINISH);
const useFileCancelListener = generateUploaderEventHook(UPLOADER_EVENTS.FILE_CANCEL);
const useFileErrorListener = generateUploaderEventHook(UPLOADER_EVENTS.FILE_ERROR);

export {
	useBatchStartListeneer,
	useBatchFinishListener,
	useBatchCancelledListener,

	useFileStartListener,
	useFileFinishListener,
	useFileCancelListener,
	useFileErrorListener,
};