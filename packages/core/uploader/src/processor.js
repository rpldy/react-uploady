// @flow
import createUploadQueue from "./queue";
import createItemsSender from "./batchItemsSender";
import createBatch from "./batch";
import { cancelBatch } from "./queue"

import type { TriggerMethod } from "@rpldy/life-events";
import type { Batch, TriggerCancellableOutcome, UploadInfo, UploadOptions } from "@rpldy/shared";
import type { UploaderCreateOptions, UploaderProcessor } from "./types";
import { UPLOADER_EVENTS } from "./consts";
import { BATCH_STATES, logger } from "@rpldy/shared";
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
                    let resultP;
                    const addedBatch = queue.addBatch(batch, processOptions);

                    if (addedBatch.items.length) {
                        resultP = queue.runCancellable(UPLOADER_EVENTS.BATCH_ADD, addedBatch, processOptions)
                            .then((isCancelled: boolean) => {
                                if (!isCancelled) {
                                    logger.debugLog(`uploady.uploader [${uploaderId}]: new items added - auto upload =
                        ${String(processOptions.autoUpload)}`, addedBatch.items);

                                    if (processOptions.autoUpload) {
                                        process(addedBatch);
                                    }
                                } else {
                                    queue.cancelBatch(addedBatch);
                                }
                            });
                    } else {
                        logger.debugLog(`uploady.uploader: no items to add. batch ${addedBatch.id} is empty. check fileFilter if this isn't intended`);
                    }

                    return resultP || Promise.resolve(addedBatch);
                });
        };

        const clearPendingBatches = () => {
            queue.clearPendingBatches();
        };

        const processPendingBatches = (uploadOptions: ?UploadOptions) => {
            queue.uploadPendingBatches(uploadOptions);
        };

        // const runCancellable = queue.runCancellable;

        return {
            process,
            abortBatch,
            abort,
            addNewBatch,
            // runCancellable,
            clearPendingBatches,
            processPendingBatches,
        };
    };

export default createProcessor;
