import {
    UploadOptions,
    Batch,
    FormatParamGroupNameMethod,
    SendMethod,
    Trigger,
    UploadInfo,
} from "@rpldy/shared";
import { OnAndOnceMethod, OffMethod } from "@rpldy/life-events";

export type SendOptions = {
    method: string;
    paramName: string;
    params: object;
    headers?: object;
    forceJsonResponse?: boolean;
    withCredentials?: boolean;
    formatGroupParamName?: FormatParamGroupNameMethod;
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
    upload: () => void;
    abort: (id?: string) => void;
    abortBatch: (id: string) => void;
    getOptions: () => CreateOptions;
    getPending: () => PendingBatch[];
    clearPending: () => void;
    on: OnAndOnceMethod;
    once: OnAndOnceMethod;
    off: OffMethod;
    registerExtension: RegisterExtensionMethod;
    getExtension: (name: unknown) => object;
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

export default createUploader;
