// @flow
import { UPLOADER_EVENTS } from "@rpldy/uploader";
import {
    generateUploaderEventHook,
    generateUploaderEventHookWithState
} from "./utils";

import type { Batch, BatchItem } from "@rpldy/shared";

const useBatchAddListener = generateUploaderEventHook(UPLOADER_EVENTS.BATCH_ADD, false);
const useBatchStartListener = generateUploaderEventHook(UPLOADER_EVENTS.BATCH_START);
const useBatchFinishListener = generateUploaderEventHook(UPLOADER_EVENTS.BATCH_FINISH);
const useBatchCancelledListener = generateUploaderEventHook(UPLOADER_EVENTS.BATCH_CANCEL);
const useBatchAbortListener = generateUploaderEventHook(UPLOADER_EVENTS.BATCH_ABORT);

const useBatchProgressListener = generateUploaderEventHookWithState(
    UPLOADER_EVENTS.BATCH_PROGRESS,
    (batch: Batch) => ({ ...batch }));

const useItemStartListener = generateUploaderEventHook(UPLOADER_EVENTS.ITEM_START);
const useItemFinishListener = generateUploaderEventHook(UPLOADER_EVENTS.ITEM_FINISH);
const useItemCancelListener = generateUploaderEventHook(UPLOADER_EVENTS.ITEM_CANCEL);
const useItemErrorListener = generateUploaderEventHook(UPLOADER_EVENTS.ITEM_ERROR);
const useItemAbortListener = generateUploaderEventHook(UPLOADER_EVENTS.ITEM_ABORT);
const useItemFinalizeListener = generateUploaderEventHook(UPLOADER_EVENTS.ITEM_FINALIZE);

const useItemProgressListener = generateUploaderEventHookWithState(
    UPLOADER_EVENTS.ITEM_PROGRESS,
    (item: BatchItem) => ({ ...item }));

const useRequestPreSend = generateUploaderEventHook(UPLOADER_EVENTS.REQUEST_PRE_SEND, false);

export {
    useBatchAddListener,
    useBatchStartListener,
    useBatchFinishListener,
    useBatchCancelledListener,
    useBatchAbortListener,
    useBatchProgressListener,

    useItemStartListener,
    useItemFinishListener,
    useItemProgressListener,
    useItemCancelListener,
    useItemErrorListener,
    useItemAbortListener,
    useItemFinalizeListener,

    useRequestPreSend,
};
