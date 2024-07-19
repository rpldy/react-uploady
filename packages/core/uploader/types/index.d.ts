import { Trigger } from "@rpldy/shared";
import { SendMethod } from "@rpldy/sender";

import {
    RawUploaderType,
    RawCreateOptions,
    UploadAddMethod,
} from "@rpldy/raw-uploader";

export type UploaderType = RawUploaderType & {
    update: (updateOptions: CreateOptions) => UploaderType;
    getOptions: () => CreateOptions;
};

export type UploaderEnhancer = (uploader: UploaderType, trigger: Trigger<any>) => UploaderType;

export interface CreateOptions extends RawCreateOptions {
    enhancer?: UploaderEnhancer | undefined;
    send?: SendMethod | undefined;
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
    BATCH_ERROR = "BATCH-ERROR",
    BATCH_FINALIZE = "BATCH-FINALIZE",

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

export { SendOptions } from "@rpldy/sender";

export {
    Batch,
    BatchItem,
    FileFilterMethod,
    Trigger,
    FILE_STATES,
    BATCH_STATES,
} from "@rpldy/shared";

export { UploadAddMethod };
