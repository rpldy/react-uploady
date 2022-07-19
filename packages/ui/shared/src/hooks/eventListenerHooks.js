// @flow
import { UPLOADER_EVENTS } from "@rpldy/uploader";
import {
    generateUploaderEventHook,
    generateUploaderEventHookWithState
} from "./hooksUtils";

import type { Batch, BatchItem } from "@rpldy/shared";
import type { CreateOptions } from "@rpldy/uploader";
import type {
    BatchEventHook,
    BatchCancellableEventHook,
    BatchEventHookWithState,
    ItemEventHook,
    ItemCancellableEventHook,
    ItemEventHookWithState,
    PreSendData,
} from "../types";

type PreSendResponse = { items?: BatchItem[], options?: CreateOptions } | boolean | void;

type RequestPreSendHook = (cb: (data: PreSendData) => PreSendResponse | Promise<PreSendResponse>) => void;

type BatchStartHook = (cb: (Batch, CreateOptions) => PreSendResponse | Promise<PreSendResponse>) => void;

const useBatchAddListener: BatchCancellableEventHook = generateUploaderEventHook(UPLOADER_EVENTS.BATCH_ADD, false);
const useBatchStartListener: BatchStartHook = generateUploaderEventHook(UPLOADER_EVENTS.BATCH_START);
const useBatchFinishListener: BatchEventHook = generateUploaderEventHook(UPLOADER_EVENTS.BATCH_FINISH);
const useBatchCancelledListener: BatchEventHook = generateUploaderEventHook(UPLOADER_EVENTS.BATCH_CANCEL);
const useBatchErrorListener: BatchEventHook = generateUploaderEventHook(UPLOADER_EVENTS.BATCH_ERROR);
const useBatchFinalizeListener: BatchEventHook = generateUploaderEventHook(UPLOADER_EVENTS.BATCH_FINALIZE);
const useBatchAbortListener: BatchEventHook = generateUploaderEventHook(UPLOADER_EVENTS.BATCH_ABORT);

const useBatchProgressListener: BatchEventHookWithState = generateUploaderEventHookWithState<Batch>(
    UPLOADER_EVENTS.BATCH_PROGRESS,
    (batch: Batch) => ({ ...batch }));

const useItemStartListener: ItemCancellableEventHook = generateUploaderEventHook(UPLOADER_EVENTS.ITEM_START);
const useItemFinishListener: ItemEventHook = generateUploaderEventHook(UPLOADER_EVENTS.ITEM_FINISH);
const useItemCancelListener: ItemEventHook = generateUploaderEventHook(UPLOADER_EVENTS.ITEM_CANCEL);
const useItemErrorListener: ItemEventHook = generateUploaderEventHook(UPLOADER_EVENTS.ITEM_ERROR);
const useItemAbortListener: ItemEventHook = generateUploaderEventHook(UPLOADER_EVENTS.ITEM_ABORT);
const useItemFinalizeListener: ItemEventHook = generateUploaderEventHook(UPLOADER_EVENTS.ITEM_FINALIZE);

const useItemProgressListener: ItemEventHookWithState = generateUploaderEventHookWithState<BatchItem>(
    UPLOADER_EVENTS.ITEM_PROGRESS,
    (item: BatchItem) => ({ ...item }));

const useRequestPreSend: RequestPreSendHook = generateUploaderEventHook(UPLOADER_EVENTS.REQUEST_PRE_SEND, false);

const useAllAbortListener: (cb: () => void) => void = generateUploaderEventHook(UPLOADER_EVENTS.ALL_ABORT, false);

export {
    useBatchAddListener,
    useBatchStartListener,
    useBatchFinishListener,
    useBatchCancelledListener,
    useBatchAbortListener,
    useBatchProgressListener,
    useBatchErrorListener,
    useBatchFinalizeListener,

    useItemStartListener,
    useItemFinishListener,
    useItemProgressListener,
    useItemCancelListener,
    useItemErrorListener,
    useItemAbortListener,
    useItemFinalizeListener,

    useRequestPreSend,

    useAllAbortListener
};
