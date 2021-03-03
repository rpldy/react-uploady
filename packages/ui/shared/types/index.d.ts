import * as React from "react";
import { Batch, BatchItem, UploadInfo, UploadOptions } from "@rpldy/shared";
import { CreateOptions, UploaderType } from "@rpldy/uploader";
import { EventCallback, OffMethod, OnAndOnceMethod } from "@rpldy/life-events";

export {
    Destination,
    FormatParamGroupNameMethod,
    FileFilterMethod,
    UploadOptions,
    Batch,
    BatchItem,

    BATCH_STATES,
    FILE_STATES,
} from "@rpldy/shared";

export {
    composeEnhancers,
    UploadAddMethod,
    UploaderEnhancer,
    CreateOptions,

    UPLOADER_EVENTS,
} from "@rpldy/uploader";

export type UploaderListeners = { [key: string]: EventCallback };

export type AddUploadFunction = (files: UploadInfo | UploadInfo[], addOptions?: UploadOptions) => void;

export type InputRef = { current: HTMLInputElement | null };

export type UploadyContextType = {
    setExternalFileInput: (inputRef: InputRef) => void;
    hasUploader: () => boolean;
    showFileUpload: (options?: UploadOptions) => void;
    upload: AddUploadFunction;
    processPending: (uploadOptions?: UploadOptions) => void;
    clearPending: () => void;
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

export const useAllAbortListener: (cb: () => void) => void;

export type PreSendData = { items: BatchItem[]; options: CreateOptions };

export const useRequestPreSend: (cb: (data: PreSendData) =>
    { items?: BatchItem[]; options?: CreateOptions }) => void;

export const useUploadOptions: (options?: CreateOptions) => CreateOptions;

export const useUploader: (options: CreateOptions, listeners?: UploaderListeners) => UploaderType;

export const UploadyContext: React.Context<UploadyContextType>;

export const assertContext: (context: UploadyContextType) => UploadyContextType;

export const useUploadyContext: () => UploadyContextType;

export const useUploady: () => UploadyContextType;

export const useAbortAll: () => () => boolean;

export const useAbortBatch: () => (batchId: string) => boolean;

export const useAbortItem: () => (itemId: string) => boolean;

export interface NoDomUploadyProps extends CreateOptions {
    debug?: boolean;
    listeners?: UploaderListeners;
    inputRef?: InputRef;
    children?: JSX.Element[] | JSX.Element;
}

export interface UploadyProps extends NoDomUploadyProps {
    customInput?: boolean;
    inputFieldContainer?: HTMLElement;
    capture?: string;
    multiple?: boolean;
    accept?: string;
    webkitdirectory?: boolean;
    fileInputId?: string;
    noPortal?: boolean;
}

export const NoDomUploady: React.ComponentType<NoDomUploadyProps>;

export interface WithRequestPreSendUpdateProps {
    id: string;
}

export interface WithRequestPreSendUpdateWrappedProps {
    id: string;
    updateRequest: (data?: boolean | { items?: BatchItem[]; options?: CreateOptions }) => void;
    requestData: PreSendData;
}

export const withRequestPreSendUpdate: <P extends WithRequestPreSendUpdateProps>(Comp: React.FC<P> | React.ComponentType<P>) =>
    React.FC<Omit<P, "updateRequest" | "requestData">>;

export const markAsUploadOptionsComponent: (Component: React.ComponentType<unknown>) => void;

export const getIsUploadOptionsComponent: (Component: React.ComponentType<unknown>) => boolean;
