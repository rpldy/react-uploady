// @flow
import { logger } from "@rpldy/shared";
import { UPLOADER_EVENTS } from "./consts";
import createUploadQueue from "./queue";
import createItemsSender from "./batchItemsSender";
import createBatch from "./batch";

import type { TriggerMethod } from "@rpldy/life-events";
import type { Batch, TriggerCancellableOutcome, UploadInfo, UploadOptions } from "@rpldy/shared";
import type { UploaderCreateOptions, UploaderProcessor } from "./types";

const createProcessor =
    (trigger: TriggerMethod, cancellable: TriggerCancellableOutcome, options: UploaderCreateOptions, uploaderId: string): UploaderProcessor => {
        const sender = createItemsSender(),
            queue = createUploadQueue(options, trigger, cancellable, sender, uploaderId);

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

        const addNewBatch = (files: UploadInfo | UploadInfo[], processOptions: UploaderCreateOptions): Promise<?Batch> =>
            createBatch(files, uploaderId, processOptions)
                .then((batch) => {
                    let resultP;

                    if (batch.items.length) {
                        const addedBatch = queue.addBatch(batch, processOptions);

                        resultP = queue.runCancellable(UPLOADER_EVENTS.BATCH_ADD, addedBatch, processOptions)
                            .then((isCancelled: boolean) => {
                                if (!isCancelled) {
                                    logger.debugLog(`uploady.uploader [${uploaderId}]: new items added - auto upload =
                       ${String(processOptions.autoUpload)}`, addedBatch.items);

                                    if (processOptions.autoUpload) {
                                        queue.uploadBatch(addedBatch);
                                    }
                                } else {
                                    queue.cancelBatch(addedBatch);
                                }

                                return addedBatch;
                            });
                    } else {
                        logger.debugLog(`uploady.uploader: no items to add. batch ${batch.id} is empty. check fileFilter if this isn't intended`);
                    }

                    return resultP || Promise.resolve(null);
                });

        const clearPendingBatches = () => {
            queue.clearPendingBatches();
        };

        const processPendingBatches = (uploadOptions: ?UploadOptions) => {
            queue.uploadPendingBatches(uploadOptions);
        };

        return {
            abortBatch,
            abort,
            addNewBatch,
            clearPendingBatches,
            processPendingBatches,
        };
    };

export default createProcessor;
