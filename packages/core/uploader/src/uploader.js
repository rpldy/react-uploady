// @flow
import addLife, { createLifePack } from "@rpldy/life-events";
import {
    BATCH_STATES,
    invariant,
    logger,
    triggerCancellable,
    devFreeze,
    merge,
    clone,
} from "@rpldy/shared";
import getProcessor from "./processor";
import { UPLOADER_EVENTS } from "./consts";
import { getMandatoryOptions, deepProxyUnwrap } from "./utils";

import type {
    UploadInfo,
    UploadOptions,
} from "@rpldy/shared";

import type  {
    UploaderType,
    PendingBatch,
    CreateOptions,
} from "./types";

const EVENT_NAMES = Object.values(UPLOADER_EVENTS);

const EXT_OUTSIDE_ENHANCER_TIME = "Uploady - uploader extensions can only be registered by enhancers",
    EXT_ALREADY_EXISTS = "Uploady - uploader extension by this name [%s] already exists";

let counter = 0;

export default (options?: CreateOptions): UploaderType => {
    counter += 1;
    const uploaderId = `uploader-${counter}`;
    let enhancerTime = false;

    const pendingBatches = [],
        extensions = {};

    logger.debugLog(`uploady.uploader: creating new instance (${uploaderId})`, { options, counter });

    let uploaderOptions: CreateOptions = getMandatoryOptions(options);

    const update = (updateOptions: CreateOptions) => {
        //TODO: updating concurrent and maxConcurrent means we need to update the processor - not supported yet!
        uploaderOptions = merge({}, uploaderOptions, updateOptions); //need deep merge for destination
        return uploader;
    };

    const add = (files: UploadInfo | UploadInfo[], addOptions?: ?UploadOptions): Promise<void> => {
        const processOptions: CreateOptions = merge({}, uploaderOptions, addOptions);

        const batch = processor.addNewBatch(files, uploader.id, processOptions);
        let resultP;

        if (batch.items.length) {
            resultP = processor.runCancellable(UPLOADER_EVENTS.BATCH_ADD, batch, processOptions)
                .then((isCancelled: boolean) => {
                    if (!isCancelled) {
                        logger.debugLog(`uploady.uploader [${uploader.id}]: new items added - auto upload =
                        ${String(processOptions.autoUpload)}`, batch.items);

                        if (processOptions.autoUpload) {
                            processor.process(batch);
                        } else {
                            if (processOptions.clearPendingOnAdd) {
                                clearPending();
                            }

                            pendingBatches.push({ batch, uploadOptions: processOptions });
                        }
                    } else {
                        batch.state = BATCH_STATES.CANCELLED;
                        triggerWithUnwrap(UPLOADER_EVENTS.BATCH_CANCEL, batch);
                    }
                });
        } else {
            logger.debugLog(`uploady.uploader: no items to add. batch ${batch.id} is empty. check fileFilter if this isn't intended`);
        }

        return resultP || Promise.resolve();
    };

    const abort = (id?: string): void => {
        processor.abort(id);
    };

    const abortBatch = (id: string): void => {
        processor.abortBatch(id);
    };

    const getPending = (): PendingBatch[] => {
        return pendingBatches.slice();
    };

    const clearPending = (): void => {
        pendingBatches.splice(0);
    };

    /**
     * Tells the uploader to process batches that weren't auto-uploaded
     */
    const upload = (uploadOptions?: ?UploadOptions): void => {
        pendingBatches
            .splice(0)
            .forEach(({ batch, uploadOptions: batchOptions }: PendingBatch) =>
                processor.process(
                    batch,
                    merge({}, batchOptions, uploadOptions))
            );
    };

    const getOptions = (): CreateOptions => {
        return clone(uploaderOptions);
    };

    const registerExtension = (name: any, methods: { [string]: any }) => {
        invariant(
            enhancerTime,
            EXT_OUTSIDE_ENHANCER_TIME
        );

        invariant(
            !extensions[name],
            EXT_ALREADY_EXISTS,
            name
        );

        logger.debugLog(`uploady.uploader: registering extension: ${name.toString()}`, methods);
        extensions[name] = methods;
    };

    const getExtension = (name: any): ?Object => {
        return extensions[name];
    };

    let { trigger, target: uploader } = addLife(
        {
            id: uploaderId,
            update,
            add,
            upload,
            abort,
            abortBatch,
            getOptions,
            getPending,
            clearPending,
            registerExtension,
            getExtension,
        },
        EVENT_NAMES,
        { canAddEvents: false, canRemoveEvents: false }
    );

    /**
     * ensures that data being exposed to client-land isnt a proxy, only pojos
     */
    const triggerWithUnwrap = (name: string, ...data: mixed[]) => {
        //delays unwrap to the very last time on trigger. Will only unwrap if there are listeners
        const lp = createLifePack(() => data.map(deepProxyUnwrap));
        return trigger(name, lp);
    };

    const cancellable = triggerCancellable(triggerWithUnwrap);

    if (uploaderOptions.enhancer) {
        enhancerTime = true;
        const enhanced = uploaderOptions.enhancer(uploader, triggerWithUnwrap);
        enhancerTime = false;
        //graceful handling for enhancer forgetting to return uploader
        uploader = enhanced || uploader;
    }

    const processor = getProcessor(triggerWithUnwrap, cancellable, uploaderOptions, uploader.id);

    return devFreeze(uploader);
};
