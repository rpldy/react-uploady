export type UploadInfo = string | object;

export type Destination = {
    url?: string;
    filesParamName?: string;
    params?: object;
    headers?: object;
    method?: string;
};

export type FormatParamGroupNameMethod = (index: number, paramName: string) => string;

export type FileFilterMethod = (file: unknown) => boolean;

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

export type Trigger<T> = (name: string, ...args: unknown[]) => Promise<T | null | undefined>[];

export type UploadData = {
    state: FileState;
    response: any;
};

export const createBatchItem: (f: UploadInfo, batchId: string) => BatchItem;
