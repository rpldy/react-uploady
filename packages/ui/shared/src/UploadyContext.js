// @flow
import React from "react";
import { logger, invariant } from "@rpldy/shared";
import { registerUploadyContextVersion  } from "./uploadyVersion";

import type { UploadyUploaderType, UploaderCreateOptions } from "@rpldy/uploader";
import type { UploadInfo, UploadOptions, GetExact } from "@rpldy/shared";
import type { EventCallback } from "@rpldy/life-events";
import type { UploadyContextType, InputRef } from "./types";

const UploadyContext: React$Context<?UploadyContextType> = React.createContext<?UploadyContextType>(null);

const NO_INPUT_ERROR_MSG = "Uploady - Context. File input isn't available";

export const createContextApi =
    (uploader: UploadyUploaderType, internalInputRef: ?InputRef): UploadyContextType => {
        let fileInputRef, showFileUploadOptions;
        let isUsingExternalInput = false;

        if (internalInputRef) {
            fileInputRef = internalInputRef;
        } else {
            logger.debugLog("Uploady context - didn't receive input field ref - waiting for external ref");
        }

        const getInputField = () => fileInputRef?.current;

        const setExternalFileInput = (extRef: InputRef) => {
            isUsingExternalInput = true;
            fileInputRef = extRef;
        };

        const getInternalFileInput = (): ?InputRef => {
            //retrieving the internal file input in userland means Uploady considers the input as custom from now on
            if (fileInputRef) {
                isUsingExternalInput = true;
            }

            return fileInputRef;
        };

        const getIsUsingExternalInput = (): boolean => isUsingExternalInput;

        const showFileUpload = (addOptions?: ?GetExact<UploadOptions>) => {
            const input: ?HTMLInputElement = getInputField();

            invariant(
                input,
                NO_INPUT_ERROR_MSG
            );

            //allow components like upload button to override options
            showFileUploadOptions = addOptions;

            input.removeEventListener("change", onFileInputChange);
            input.addEventListener("change", onFileInputChange);

            //clear the input value so same file can be uploaded again
            input.value = "";
            input.click();
        };

        const onFileInputChange = () => {
            const input: ?HTMLInputElement = getInputField();

            invariant(
                input,
                NO_INPUT_ERROR_MSG
            );

            input.removeEventListener("change", onFileInputChange);

            const addOptions = showFileUploadOptions;
            showFileUploadOptions = null;
            upload(input.files, addOptions);
        };

        const upload = (files: UploadInfo | UploadInfo[], addOptions?: ?UploadOptions) => {
            uploader.add(files, addOptions);
        };

		const processPending = (uploadOptions?: ?UploadOptions) => {
			uploader.upload(uploadOptions);
		};

        const clearPending = () => {
            uploader.clearPending();
        };

        const setOptions = (options: UploaderCreateOptions) => {
            uploader.update(options);
        };

        const getOptions = () => {
            return uploader.getOptions();
        };

        const getExtension = (name: string | Symbol): ?Object => {
            return uploader.getExtension(name);
        };

        const abort = (itemId?: string) => {
            uploader.abort(itemId);
        };

        const abortBatch = (batchId: string) => {
            uploader.abortBatch(batchId);
        };

        const on = (name: any, cb: EventCallback) => {
            return uploader.on(name, cb);
        };

        const once = (name: any, cb: EventCallback) => {
            return uploader.once(name, cb);
        };

        const off = (name: any, cb?: EventCallback) => {
            return uploader.off(name, cb);
        };

        const hasUploader = () => !!uploader;

        //We register the version on the global object to be able to warn devs when they're using packages from different uploady versions
        //causing the context not to be available
        registerUploadyContextVersion();

        return {
            hasUploader,
            getInternalFileInput,
            setExternalFileInput,
            getIsUsingExternalInput,
            showFileUpload,
            upload,
			processPending,
            clearPending,
            setOptions,
            getOptions,
            getExtension,
            abort,
            abortBatch,
            on,
            once,
            off,
        };
    };

export default UploadyContext;
