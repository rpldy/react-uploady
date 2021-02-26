export type Destination = {
    url?: string;
    filesParamName?: string;
    params?: Record<string, unknown>;
    headers?: Record<string, unknown>;
    method?: string;
};

export type FormatParamGroupNameMethod = (index: number, paramName: string) => string;

export type FormatServerResponseMethod = (response: string, status: number, headers: Record<string, string> | undefined) => unknown;

export type FileFilterMethod = (file: unknown, index: number, files: unknown[]) => boolean;

export interface UploadOptions {
    autoUpload?: boolean;
    clearPendingOnAdd?: boolean;
    formatGroupParamName?: FormatParamGroupNameMethod;
    grouped?: boolean;
    maxGroupSize?: number;
    fileFilter?: FileFilterMethod;

    //send options
    destination?: Destination;
    inputFieldName?: string;
    method?: string;
    params?: Record<string, unknown>;
    forceJsonResponse?: boolean;
    withCredentials?: boolean;
    sendWithFormData?: boolean;
    formatServerResponse?: FormatServerResponseMethod,
}

export enum BATCH_STATES {
    PENDING = "pending",
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
    state: BATCH_STATES;
    completed: number;
    loaded: number;
    orgItemCount: number;
};

export enum FILE_STATES {
    PENDING = "pending",
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
    state: FILE_STATES;
    uploadResponse?: any;
    uploadStatus: number;
    completed: number;
    loaded: number;
    recycled: boolean;
    previousBatch?: string;
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

export interface RequestOptions {
    method?: string;
    headers?: Record<string, string>;
    withCredentials?: boolean;
    preSend?: (xhr: XMLHttpRequest) => void,
}

export type BatchItem = BatchUrl & BatchFile;

export type UploadInfo = string | FileLike | BatchItem;

export type Trigger<T> = (name: string, ...args: unknown[]) => Promise<T | null | undefined>[];

export type UploadData = {
    status: number;
    state: FILE_STATES;
    response: any;
};

export const createBatchItem: (f: UploadInfo, batchId: string, isPending?: boolean) => BatchItem;

export const isPlainObject: (obj: unknown) => boolean;

export const isFunction: (val: unknown) => boolean;

export const isProduction: boolean;

export const hasWindow: boolean;

export const pick: <T>(obj: T, props: string[]) => T;

export type MergeFn = <T>(target: T, ...sources: T[]) => T;

export const merge: MergeFn;

export const clone: <T>(obj: T, mergeFn?: MergeFn) => T;

export const devFreeze: <T>(obj: T) => T;

export const isSamePropInArrays: (arr1: any[], arr2: any[], prop: string | string[]) => boolean;

export const request: (url: string, data?: unknown, options?: RequestOptions) => Promise<XMLHttpRequest>;
