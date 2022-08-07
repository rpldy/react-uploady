// @flow
import type {
    UploadInfo,
    UploadOptions,
    BatchItem,
    Batch,
    Trigger,
    Cancellable,
} from "@rpldy/shared";

import type { OnAndOnceMethod, OffMethod } from "@rpldy/life-events";

import type { SendResult, SendMethod } from "@rpldy/sender";
import type { AbortAllMethod, AbortBatchMethod, AbortItemMethod } from "@rpldy/abort";

// eslint-disable-next-line no-use-before-define
export type UploaderEnhancer = (uploader: UploaderType, trigger: Trigger<mixed>) => UploaderType;

export type CreateOptions =  {|
    ...UploadOptions,
    //uploader enhancer function
    enhancer?: UploaderEnhancer,
    //whether multiple upload requests can be issued simultaneously (default: false)
    concurrent?: boolean,
    //the maximum allowed for simultaneous requests (default: 2)
    maxConcurrent?: number,
    //the send method to use. Allows overriding the method used to send files to the server for example using a mock (default: @rpldy/sender)
    send?: ?SendMethod<any>,
    //
    abortAll?: AbortAllMethod,
    //
    abortBatch?: AbortBatchMethod,
    //
    abortItem?: AbortItemMethod,
|};

export type UploaderType = {
	id: string,
	update: (updateOptions: CreateOptions) => UploaderType,
	add: (files: UploadInfo | UploadInfo[], addOptions?: ?UploadOptions) => Promise<void>,
	upload: (uploadOptions?: ?UploadOptions) => void,
	abort: (id?: string) => void,
	abortBatch: (id: string) => void,
	getOptions: () => CreateOptions,
	clearPending: () => void,
	on: OnAndOnceMethod,
	once: OnAndOnceMethod,
	off: OffMethod,
    registerExtension: (any, {[string]: any}) => void,
    getExtension: (any) => ?Object,
};

export type ItemsSender = {
	send: (BatchItem[], Batch, CreateOptions) => SendResult,
	on: OnAndOnceMethod,
};

export type UploaderProcessor = {|
    abort: (id?: string) => void,
    abortBatch: (batchId: string) => void,
    addNewBatch: (
        files: UploadInfo | Array<UploadInfo>,
        uploaderId: string,
        processOptions: CreateOptions
    ) => any,
    clearPendingBatches: () => void,
    process: (batch: Batch, batchOptions?: CreateOptions) => void,
    processPendingBatches: (uploadOptions: ?UploadOptions) => void,
    runCancellable: Cancellable,
|}
