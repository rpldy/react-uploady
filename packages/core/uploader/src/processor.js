// @flow
import createUploadQueue from "./queue";
import createItemsSender from "./batchItemsSender";
import createBatch from "./batch";

import type { TriggerMethod } from "@rpldy/life-events";
import type { Batch, TriggerCancellableOutcome, UploadInfo, UploadOptions } from "@rpldy/shared";
import type { UploaderCreateOptions, UploaderProcessor } from "./types";

const createProcessor =
    (trigger: TriggerMethod, cancellable: TriggerCancellableOutcome, options: UploaderCreateOptions, uploaderId: string):
        UploaderProcessor => {
        const sender = createItemsSender(),
            queue = createUploadQueue(options, trigger, cancellable, sender, uploaderId);

        const process = (batch: Batch, batchOptions?: UploaderCreateOptions) => {
            queue.uploadBatch(batch, batchOptions);
        };

        const abortBatch = (batchId: string) => {
            queue.abortBatch(batchId);
        };

        const abort = (id?: string) => {
            if (id) {
                queue.abortItem(id);
            } else {
                queue.abortAll();
            }
        };

        const addNewBatch = (files: UploadInfo | UploadInfo[], uploaderId: string, processOptions: UploaderCreateOptions): Promise<Batch> => {
            return createBatch(files, uploaderId, processOptions)
                .then((batch) => {
                    return queue.addBatch(batch, processOptions);
                });
        };

        const clearPendingBatches = () => {
            queue.clearPendingBatches();
        };

        const processPendingBatches = (uploadOptions: ?UploadOptions) => {
            queue.uploadPendingBatches(uploadOptions);
        };

        const runCancellable = queue.runCancellable;

        return {
            process,
            abortBatch,
            abort,
            addNewBatch,
            runCancellable,
            clearPendingBatches,
            processPendingBatches,
        };
    };

export default createProcessor;
