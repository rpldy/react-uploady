// @flow
import type { Trigger, UploadInfo, UploadOptions } from "@rpldy/shared";
import type { OffMethod, OnAndOnceMethod } from "@rpldy/life-events";

// eslint-disable-next-line no-use-before-define
export type UploaderEnhancer<T> = (uploader: UploaderType<T>, trigger: Trigger<mixed>) => UploaderType<T>;

export type RawCreateOptions = {|
    ...UploadOptions,
    //uploader enhancer function
    enhancer?: UploaderEnhancer<any>,
    //whether multiple upload requests can be issued simultaneously (default: false)
    concurrent?: boolean,
    //the maximum allowed for simultaneous requests (default: 2)
    maxConcurrent?: number,
|};

export type UploaderType<T> = {
    id: string,
    update: (updateOptions: T) => UploaderType<T>,
    add: (files: UploadInfo | UploadInfo[], addOptions?: ?UploadOptions) => Promise<void>,
    upload: (uploadOptions?: ?UploadOptions) => void,
    abort: (id?: string) => void,
    abortBatch: (id: string) => void,
    getOptions: () => T,
    clearPending: () => void,
    on: OnAndOnceMethod,
    once: OnAndOnceMethod,
    off: OffMethod,
    registerExtension: (any, {[string]: any}) => void,
    getExtension: (any) => ?Object,
};
