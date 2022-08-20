// @flow
import type {
    UploadInfo,
    UploadOptions,
    BatchItem,
    Batch,
    // Trigger,
    Cancellable,
} from "@rpldy/shared";

import type { OnAndOnceMethod } from "@rpldy/life-events";
import type { UploaderType } from "@rpldy/raw-uploader";
import type { SendResult, SendMethod } from "@rpldy/sender";
import type { CreateOptionsWithAbort } from "@rpldy/abort";

export type UploaderCreateOptions = {|
    ...CreateOptionsWithAbort,

    //the send method to use. Allows overriding the method used to send files to the server for example using a mock (default: @rpldy/sender)
    send?: ? SendMethod<any>,
|};

export type ItemsSender = {
	send: (BatchItem[], Batch, UploaderCreateOptions) => SendResult,
	on: OnAndOnceMethod,
};

export type UploaderProcessor = {|
    abort: (id?: string) => void,
    abortBatch: (batchId: string) => void,
    addNewBatch: (
        files: UploadInfo | Array<UploadInfo>,
        uploaderId: string,
        processOptions: UploaderCreateOptions
    ) => any,
    clearPendingBatches: () => void,
    process: (batch: Batch, batchOptions?: UploaderCreateOptions) => void,
    processPendingBatches: (uploadOptions: ?UploadOptions) => void,
    runCancellable: Cancellable,
|};

export type UploadyUploaderType = UploaderType<UploaderCreateOptions>;
