// @flow
import type {
    UploadInfo,
    UploadOptions,
    BatchItem,
    Batch,
} from "@rpldy/shared";

import type { OnAndOnceMethod } from "@rpldy/life-events";
import type { UploaderType } from "@rpldy/raw-uploader";
import type { SendResult, SendMethod } from "@rpldy/sender";
import type { CreateOptionsWithAbort } from "@rpldy/abort";
import {  } from "@rpldy/sender/src";

export type UploaderCreateOptions = {|
    ...CreateOptionsWithAbort,

    //the send method to use. Allows overriding the method used to send files to the server for example using a mock (default: @rpldy/sender)
    send?: ? SendMethod<any>,
|};

export type BatchItemSenderSendMethod = (BatchItem[], Batch, UploaderCreateOptions) => SendResult;

export type ItemsSender = {
	send: BatchItemSenderSendMethod,
	on: OnAndOnceMethod,
};

export type UploaderProcessor = {|
    abort: (id?: string) => void,
    abortBatch: (batchId: string) => void,
    addNewBatch: (
        files: UploadInfo | UploadInfo[],
        processOptions: UploaderCreateOptions
    ) => Promise<?Batch>,
    clearPendingBatches: () => void,
    processPendingBatches: (uploadOptions: ?UploadOptions) => void,
|};

export type UploadyUploaderType = UploaderType<UploaderCreateOptions>;
