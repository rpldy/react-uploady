// @flow
import React from "react";
import type { UploaderType } from "@rpldy/uploader";
import type { UploadyContextType } from "./types";
import type { UploadInfo, UploadOptions } from "@rpldy/shared";
import type { EventCallback } from "@rpldy/life-events";

const UploadyContext = React.createContext<?UploadyContextType>(null);

export const createContextApi =
    (uploader: UploaderType, inputRef: { current: ?HTMLInputElement }): UploadyContextType => {
        let showFileUploadOptions;

        const getInputField = () => inputRef.current;

        const showFileUpload = (addOptions?: UploadOptions) => {
            //allow components like upload button to override options
            showFileUploadOptions = addOptions;

            const input = getInputField();

            if (input) {
                //clear the input value so same file can be uploaded again
                input.value = "";
                input.click();
            }
        };

        const onFileInputChange = (e) => {
            const addOptions = showFileUploadOptions;
            showFileUploadOptions = null;
            upload(e.files, addOptions);
        };

        const upload = (files: UploadInfo | UploadInfo[], addOptions?: UploadOptions) => {
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
            onFileInputChange,
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
