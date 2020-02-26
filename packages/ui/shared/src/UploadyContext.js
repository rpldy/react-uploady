// @flow
import React from "react";
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

            if (!input) {
                throw new Error("Uploady - Cannot show file upload as file input isn't available");
            }

            //allow components like upload button to override options
            showFileUploadOptions = addOptions;

            // $FlowFixMe - flow cant deal with file input events :(
            input.removeEventListener("change", onFileInputChange);
            // $FlowFixMe - flow cant deal with file input events :(
            input.addEventListener("change", onFileInputChange);

            //clear the input value so same file can be uploaded again
            input.value = "";
            input.click();
        };

        const onFileInputChange = (e: {target: HTMLInputElement}) => {
            const addOptions = showFileUploadOptions;
            showFileUploadOptions = null;
            upload(e.target.files, addOptions);
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
