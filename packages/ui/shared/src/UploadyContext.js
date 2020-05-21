// @flow
import React from "react";
import { logger, invariant } from "@rpldy/shared";
import type { UploaderType, CreateOptions } from "@rpldy/uploader";
import type { UploadInfo, UploadOptions, GetExact } from "@rpldy/shared";
import type { EventCallback } from "@rpldy/life-events";
import type { UploadyContextType, InputRef } from "./types";

const UploadyContext = React.createContext<?UploadyContextType>(null);

const NO_INPUT_ERROR_MSG = "Uploady - Context. File input isn't available";

export const createContextApi =
    (uploader: UploaderType, internalInputRef: ?InputRef): UploadyContextType => {
        let fileInputRef, showFileUploadOptions;

        if (internalInputRef) {
            fileInputRef = internalInputRef;
        } else {
            logger.debugLog("Uploady context - didn't receive input field ref - waiting for external ref");
        }

        const getInputField = () => fileInputRef?.current;

        const setExternalFileInput = (extRef: InputRef) => {
            fileInputRef = extRef;
        };

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

		const processPending = () => {
			uploader.upload();
		};

        const setOptions = (options: CreateOptions) => {
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

        return {
            hasUploader,
            setExternalFileInput,
            showFileUpload,
            upload,
			processPending,
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
