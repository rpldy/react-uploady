// @flow
import addLife, { createLifePack } from "@rpldy/life-events";
import {
    invariant,
    logger,
    triggerCancellable,
    devFreeze,
    merge,
    clone,
} from "@rpldy/shared";
import getAbortEnhancer from "@rpldy/abort";
import getProcessor from "./processor";
import { UPLOADER_EVENTS } from "./consts";
import { getMandatoryOptions, deepProxyUnwrap } from "./utils";
import composeEnhancers from "./composeEnhancers";

import type {
    UploadInfo,
    UploadOptions,
} from "@rpldy/shared";
import type { TriggerMethod } from "@rpldy/life-events";
import type { UploaderEnhancer } from "@rpldy/raw-uploader";
import type  {
    UploaderCreateOptions,
    UploadyUploaderType,
} from "./types";

const EVENT_NAMES = Object.values(UPLOADER_EVENTS);

const EXT_OUTSIDE_ENHANCER_TIME = "Uploady - uploader extensions can only be registered by enhancers",
    EXT_ALREADY_EXISTS = "Uploady - uploader extension by this name [%s] already exists";

let counter = 0;

const getComposedEnhancer = (extEnhancer: UploaderEnhancer<any>) =>
    composeEnhancers(getAbortEnhancer<UploaderCreateOptions>(), extEnhancer);

const getEnhancedUploader = (
    uploader: UploadyUploaderType,
    options: UploaderCreateOptions,
    triggerWithUnwrap: TriggerMethod,
    setEnhancerTime: (boolean) => void
) => {
    //TODO: create raw-uploader without internal enhancers (while default-uploader will use abort & xhr-sender enhancers)

    //TODO need new mechanism for registering and using internal methods (abort, send)
    //that will use enhancers but also allow overrides without having to expose the method in the options (ie: send)
    const enhancer = options.enhancer ?
        getComposedEnhancer(options.enhancer) :
        getAbortEnhancer();

    setEnhancerTime(true);
    const enhanced = enhancer(uploader, triggerWithUnwrap);
    setEnhancerTime(false);

    //graceful handling for enhancer forgetting to return uploader
    return enhanced || uploader;
};

const createUploader = (options?: UploaderCreateOptions): UploadyUploaderType => {
    counter += 1;
    const uploaderId = `uploader-${counter}`;
    let enhancerTime = false;

    const extensions = {};

    logger.debugLog(`uploady.uploader: creating new instance (${uploaderId})`, { options, counter });

    let uploaderOptions: UploaderCreateOptions = getMandatoryOptions(options);

    const setEnhancerTime = (state: boolean) => {
        enhancerTime = state;
    };

    const update: (UploaderCreateOptions) => UploadyUploaderType  = (updateOptions: UploaderCreateOptions) => {
        //TODO: updating concurrent and maxConcurrent means we need to update the processor - not supported yet!
        uploaderOptions = merge({}, uploaderOptions, updateOptions); //need deep merge for destination
        return uploader;
    };

    const add = (files: UploadInfo | UploadInfo[], addOptions?: ?UploadOptions): Promise<void> => {
        const processOptions: UploaderCreateOptions = merge({}, uploaderOptions, addOptions);

        if (processOptions.clearPendingOnAdd) {
            clearPending();
        }

        return processor
            .addNewBatch(files, processOptions)
            .then(() => {
                logger.debugLog(`uploady.uploader: finished adding file data to be processed`);
            });
    };

    const abort = (id?: string): void => {
        processor.abort(id);
    };

    const abortBatch = (id: string): void => {
        processor.abortBatch(id);
    };

    const clearPending = (): void => {
        processor.clearPendingBatches();
    };

    /**
     * process batches that weren't auto-uploaded
     */
    const upload = (uploadOptions?: ?UploadOptions): void => {
        processor.processPendingBatches(uploadOptions);
    };

    const getOptions = (): UploaderCreateOptions => {
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

    const enhancedUploader = getEnhancedUploader(uploader, uploaderOptions, triggerWithUnwrap, setEnhancerTime);

    const processor = getProcessor(triggerWithUnwrap, cancellable, uploaderOptions, enhancedUploader.id);

    return devFreeze(enhancedUploader);
};

export default createUploader;
