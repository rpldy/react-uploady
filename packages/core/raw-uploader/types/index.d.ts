import { Batch, Trigger, UploadInfo, UploadOptions } from "@rpldy/shared";
import { OffMethod, OnAndOnceMethod } from "@rpldy/life-events";

export interface RawCreateOptions extends UploadOptions {
    enhancer?: RawUploaderEnhancer | undefined;
    concurrent?: boolean | undefined;
    maxConcurrent?: number | undefined;
}

export type PendingBatch = {
    batch: Batch;
    uploadOptions: RawCreateOptions;
};

export type UploadAddMethod = (files: UploadInfo | UploadInfo[], addOptions?: UploadOptions) => Promise<void>

export type RegisterExtensionMethod = (name: unknown, methods: { [key: string]: (...args: any[]) => void | unknown }) => void;

export type RawUploaderType = {
    id: string;
    update: (updateOptions: RawCreateOptions) => RawUploaderType;
    add: UploadAddMethod;
    upload: (uploadOptions?: UploadOptions) => void;
    abort: (id?: string) => void;
    abortBatch: (id: string) => void;
    getOptions: () => RawCreateOptions;
    clearPending: () => void;
    on: OnAndOnceMethod;
    once: OnAndOnceMethod;
    off: OffMethod;
    registerExtension: RegisterExtensionMethod;
    getExtension: (name: unknown) => Record<string, unknown>;
};

export type RawUploaderEnhancer = (uploader: RawUploaderType, trigger: Trigger<any>) => RawUploaderType;

//TODO: update after implementation
export const createRawUploader: (options: RawCreateOptions) => RawUploaderType;
