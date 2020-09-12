export type Destination = {
    url?: string;
    filesParamName?: string;
    params?: Record<string, unknown>;
    headers?: Record<string, unknown>;
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
    params?: Record<string, unknown>;
    forceJsonResponse?: boolean;
    withCredentials?: boolean;
    sendWithFormData?: boolean;
}

export enum BATCH_STATES {
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
};

export enum FILE_STATES {
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
    completed: number;
    loaded: number;
    recycled: boolean;
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

export type UploadInfo = string | FileLike | BatchItem;

export type Trigger<T> = (name: string, ...args: unknown[]) => Promise<T | null | undefined>[];

export type UploadData = {
    status: number;
    state: FILE_STATES;
    response: any;
};

export const createBatchItem: (f: UploadInfo, batchId: string) => BatchItem;

export const isPlainObject: (obj: unknown) => boolean;
