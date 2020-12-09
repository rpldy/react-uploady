import {
    UploadOptions,
    Batch,
    FormatParamGroupNameMethod,
    Trigger,
    UploadInfo,
} from "@rpldy/shared";
import {
    SendMethod,
} from "@rpldy/sender";

import { OnAndOnceMethod, OffMethod } from "@rpldy/life-events";

export type SendOptions = {
    method: string;
    paramName: string;
    params: Record<string, unknown>;
    headers?: Record<string, unknown>;
    forceJsonResponse?: boolean;
    withCredentials?: boolean;
    formatGroupParamName?: FormatParamGroupNameMethod;
    sendWithFormData: boolean;
};

export type UploadAddMethod = (files: UploadInfo | UploadInfo[], addOptions?: UploadOptions) => Promise<void>

export type PendingBatch = {
    batch: Batch;
    uploadOptions: CreateOptions;
};

export type RegisterExtensionMethod = (name: unknown, methods: { [key: string]: (...args: any[]) => void | unknown }) => void;

export type UploaderType = {
    id: string;
    update: (updateOptions: CreateOptions) => UploaderType;
    add: UploadAddMethod;
    upload: (uploadOptions?: UploadOptions) => void;
    abort: (id?: string) => void;
    abortBatch: (id: string) => void;
    getOptions: () => CreateOptions;
    getPending: () => PendingBatch[];
    clearPending: () => void;
    on: OnAndOnceMethod;
    once: OnAndOnceMethod;
    off: OffMethod;
    registerExtension: RegisterExtensionMethod;
    getExtension: (name: unknown) => Record<string, unknown>;
}

export type UploaderEnhancer = (uploader: UploaderType, trigger: Trigger<any>) => UploaderType;

export interface CreateOptions extends UploadOptions {
    enhancer?: UploaderEnhancer;
    concurrent?: boolean;
    maxConcurrent?: number;
    send?: SendMethod;
}

export type UploaderCreator = (options?: CreateOptions) => UploaderType;

export const composeEnhancers: (...enhancers: UploaderEnhancer[]) => UploaderEnhancer;

export const createUploader: UploaderCreator;

export enum UPLOADER_EVENTS {
    BATCH_ADD = "BATCH-ADD",
    BATCH_START = "BATCH-START",
    BATCH_PROGRESS = "BATCH_PROGRESS",
    BATCH_FINISH = "BATCH-FINISH",
    BATCH_ABORT = "BATCH-ABORT",
    BATCH_CANCEL = "BATCH-CANCEL",

    ITEM_START = "FILE-START",
    ITEM_CANCEL = "FILE-CANCEL",
    ITEM_PROGRESS = "FILE-PROGRESS",
    ITEM_FINISH = "FILE-FINISH",
    ITEM_ABORT = "FILE-ABORT",
    ITEM_ERROR = "FILE-ERROR",
    ITEM_FINALIZE = "FILE-FINALIZE",

    REQUEST_PRE_SEND = "REQUEST_PRE_SEND",

    ALL_ABORT =  "ALL_ABORT",
}

export default createUploader;
