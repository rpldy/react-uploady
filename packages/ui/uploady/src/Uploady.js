// @flow
import React, { useMemo, useRef } from "react";
import ReactDOM from "react-dom";
import { logger } from "@rpldy/shared";
import { UploadyContext, createContextApi } from "@rpldy/shared-ui";
import useUploader from "./useUploader";

import type { UploadyProps } from "./types";

const FileInputFieldPortal = ({ container, children }) =>
    container && ReactDOM.createPortal(children, container);

const Uploady = (props: UploadyProps) => {

    logger.setDebug(!!props.debug);
    logger.debugLog("@@@@@@ Uploady Rendering @@@@@@", props);

    const inputFieldContainer = document.body;
    const inputFieldRef = useRef<?HTMLInputElement>(null);

    const uploader = useUploader(props);

    //TODO: ALLOW TO SET INPUT FIELD CONTAINER : props.inputFieldContainer
    //TODO: allow to use input field from outside - using hook?

    const api = useMemo(() =>
        createContextApi(uploader, inputFieldRef), [uploader, inputFieldRef]);

    //TODO: FILE INPUT ATTRS  TO USE !!!!!!!!!
    // accept - https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#accept
    // capture - https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#capture
    // webkitdirectory - https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/webkitdirectory

    const instanceOptions = uploader.getOptions();

    //TODO !!!!!!!!! move rendering of portal and input to memoized component !!!!!!!

    return <UploadyContext.Provider value={api}>
        <FileInputFieldPortal container={inputFieldContainer}>
            <input
                type="file"
                name={instanceOptions.inputFieldName}
                multiple={instanceOptions.multiple}
                style={{ display: "none" }}
                ref={inputFieldRef} />
        </FileInputFieldPortal>

        {props.children}
    </UploadyContext.Provider>;
};

export default Uploady;
