import * as React from "react";

declare namespace rpldy {

    export type Destination = {
        url?: string;
        filesParamName?: string;
        params?: object;
        headers?: object;
        method?: string;
    };

    export type FormatParamGroupNameMethod = (index: number, paramName: string) => string;

    export type FileFilterMethod = (file: unknown) => boolean;

    export type Trigger<T> = (name: string, ...args: unknown[]) => Promise<T | null | undefined>[];

    export type UploadInfo = string | object;

    export type UploadAddMethod = (files: UploadInfo | UploadInfo[], addOptions?: UploadOptions) => Promise<void>

    export type RegisterExtensionMethod = (name: unknown, methods: { [key: string]: (...args: any[]) => void | unknown }) => void;

    export enum BatchState {
        ADDED = "added",
        PROCESSING = "processing",
        UPLOADING = "uploading",
        CANCELLED = "cancelled",
        FINISHED = "finished",
        ABORTED = "aborted",
    }

    export type Batch = {
        id: string;
        uploaderId: string;
        items: BatchItem[];
        state: BatchState;
        completed: number;
        loaded: number;
    };

    export type PendingBatch = {
        batch: Batch;
        uploadOptions: CreateOptions;
    };

    export type OffMethod = (name: unknown, cb?: EventCallback) => void;

    export type OnAndOnceMethod = (name: unknown, cb: EventCallback) => OffMethod;

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

    export enum FileState {
        ADDED = "added",
        UPLOADING = "uploading",
        CANCELLED = "cancelled",
        FINISHED = "finished",
        ERROR = "error",
        ABORTED = "aborted",
    }

    interface BatchItemBase {
        id: string;
        batchId: string;
        state: FileState;
        uploadResponse?: any;
        completed: number;
        loaded: number;
    }

    export type FileLike = {
        name: string;
        size: number;
        type: string;
        lastModified: number;
    }

    interface BatchUrl extends BatchItemBase {
        url: string;
    }

    interface BatchFile extends BatchItemBase {
        file: FileLike;
    }

    export type BatchItem = BatchUrl & BatchFile;

    export type SendOptions = {
        method: string;
        paramName: string;
        params: object;
        headers?: object;
        forceJsonResponse?: boolean;
        withCredentials?: boolean;
        formatGroupParamName?: FormatParamGroupNameMethod;
    };

    export type UploadData = {
        state: FileState;
        response: any;
    };

    export type SendResult = {
        request: Promise<UploadData>;
        abort: () => boolean;
    };

    export type SenderProgressEvent = {
        total: number;
        loaded: number;
    };

    export type OnProgress = (e: SenderProgressEvent, objs: object[]) => void;

    export type SendMethod = (item: BatchItem[], url: string, options: SendOptions, onProgress: OnProgress) => SendResult;

    export type EventCallback = (name: unknown, ...args: any[]) => unknown;

    export type UploaderListeners = { [key: string]: EventCallback };

    export interface UploadOptions {
        autoUpload?: boolean;
        destination?: Destination;
        inputFieldName?: string;
        formatGroupParamName?: FormatParamGroupNameMethod;
        grouped?: boolean;
        maxGroupSize?: number;
        fileFilter?: FileFilterMethod;
        method?: string;
        params?: object;
        forceJsonResponse?: boolean;
        withCredentials?: boolean;
    }

    export interface CreateOptions extends UploadOptions {
        enhancer?: UploaderEnhancer;
        concurrent?: boolean;
        maxConcurrent?: number;
        send?: SendMethod;
    }

    export interface UploadyProps extends CreateOptions {
        debug?: boolean;
        listeners?: UploaderListeners;
        customInput?: boolean;
        inputFieldContainer?: HTMLElement;
        children?: JSX.Element[] | JSX.Element;
        capture?: string;
        multiple?: boolean;
        accept?: string;
        webkitdirectory?: boolean;
        fileInputId?: string;
    }

    export const Uploady: React.ComponentType<UploadyProps>;
}

export = rpldy.Uploady;
