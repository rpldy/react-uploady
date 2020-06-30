import * as React from "react";
import { Batch, BatchItem, UploadInfo, UploadOptions } from "@rpldy/shared";
import { CreateOptions } from "@rpldy/uploader";
import { OffMethod, OnAndOnceMethod } from "@rpldy/life-events";

export type AddUploadFunction = (files: UploadInfo | UploadInfo[], addOptions?: UploadOptions) => void;

export type InputRef = { current: HTMLInputElement | null };

export type UploadyContextType = {
    setExternalFileInput: (inputRef: InputRef) => void;
    hasUploader: () => boolean;
    showFileUpload: (options?: UploadOptions) => void;
    upload: AddUploadFunction;
    processPending: () => void;
    setOptions: (options: CreateOptions) => void;
    getOptions: () => CreateOptions;
    on: OnAndOnceMethod;
    once: OnAndOnceMethod;
    off: OffMethod;
    abort: (id?: string) => void;
    abortBatch: (id: string) => void;
    getExtension: (name: unknown) => Record<string, unknown>;
};

type EventHook<T> = (cb: (obj: T) => void, id?: string) => void;
type CancellableHook<T> = (cb: (obj: T) => boolean | void, id?: string) => void;
type EventHookWithState<T> = (cb?: (obj: T) => void, id?: string) => T;

type ItemEventHook = EventHook<BatchItem>;
type ItemCancellableEventHook = CancellableHook<BatchItem>;
type ItemEventHookWithState = EventHookWithState<BatchItem>;

type BatchEventHook = EventHook<Batch>;
type BatchCancellableEventHook = CancellableHook<Batch>;
type BatchEventHookWithState = EventHookWithState<Batch>;

export const useBatchAddListener: BatchCancellableEventHook;
export const useBatchStartListener: BatchCancellableEventHook;
export const useBatchProgressListener: BatchEventHookWithState;
export const useBatchFinishListener: BatchEventHook;
export const useBatchCancelledListener: BatchEventHook;
export const useBatchAbortListener: BatchEventHook;

export const useItemStartListener: ItemCancellableEventHook;
export const useItemFinishListener: ItemEventHook;
export const useItemProgressListener: ItemEventHookWithState;
export const useItemCancelListener: ItemEventHook;
export const useItemErrorListener: ItemEventHook;
export const useItemAbortListener: ItemEventHook;
export const useItemFinalizeListener: ItemEventHook;

export type PreSendData = { items: BatchItem[]; options: CreateOptions };

export const useRequestPreSend: (cb: (data: PreSendData) =>
    { items?: BatchItem[]; options?: CreateOptions }) => void;

export const useUploadOptions: (options?: CreateOptions) => CreateOptions;

export const UploadyContext: React.Context<UploadyContextType>;

export const assertContext: (context: UploadyContextType) => UploadyContextType;

export const useAbortAll: () => () => boolean;

export const useAbortBatch: () => (batchId: string) => boolean;

export const useAbortItem: () => (itemId: string) => boolean;