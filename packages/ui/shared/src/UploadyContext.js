// @flow
import React from "react";
import warning from "warning";
import type { UploaderType } from "@rpldy/uploader";
import type { UploadyContextType } from "./types";
import type { UploadInfo, UploadOptions, GetExact } from "@rpldy/shared";
import type { EventCallback } from "@rpldy/life-events";

const UploadyContext = React.createContext<?UploadyContextType>(null);

export const createContextApi =
    (uploader: UploaderType, inputRef: { current: ?HTMLInputElement }): UploadyContextType => {
        let showFileUploadOptions;

        const getInputField = () => inputRef.current;

        const showFileUpload = (addOptions?: ?GetExact<UploadOptions>) => {
            const input : ?HTMLInputElement = getInputField();

            warning(
                input,
                "Uploady - Cannot show file upload. File input isn't available"
            );

            if (input) {
                //allow components like upload button to override options
                showFileUploadOptions = addOptions;

                input.removeEventListener("change", onFileInputChange);
                input.addEventListener("change", onFileInputChange);

                //clear the input value so same file can be uploaded again
                input.value = "";
                input.click();
            }
        };

        const onFileInputChange = () => {
            const input : ?HTMLInputElement = getInputField();

            if (input) {
                const addOptions = showFileUploadOptions;
                showFileUploadOptions = null;
                upload(input.files, addOptions);
            }
        };

        const upload = (files: UploadInfo | UploadInfo[], addOptions?: ?UploadOptions) => {
            uploader.add(files, addOptions);
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
            uploader.off(name, cb);
        };

        const hasUploader = () => !!uploader;

        return {
            hasUploader,
            showFileUpload,
            upload,
            abort,
            abortBatch,
            on,
            once,
            off,
        };
    };

export default UploadyContext;
