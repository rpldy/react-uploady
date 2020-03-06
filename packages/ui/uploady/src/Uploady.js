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
    const { multiple, capture, accept, webkitdirectory, listeners, debug, children, ...uploadOptions } = props;

    logger.setDebug(!!debug);
    logger.debugLog("@@@@@@ Uploady Rendering @@@@@@", props);

    const inputFieldContainer = document.body;
    const inputFieldRef = useRef<?HTMLInputElement>(null);

    const uploader = useUploader(uploadOptions, listeners);

    //TODO: ALLOW TO SET INPUT FIELD CONTAINER : props.inputFieldContainer
    //TODO: allow to use input field from outside - using hook?

    const api = useMemo(() =>
        createContextApi(uploader, inputFieldRef), [uploader, inputFieldRef]);

    const instanceOptions = uploader.getOptions();

    //TODO !!!!!!!!! move rendering of portal and input to memoized component !!!!!!!

    return <UploadyContext.Provider value={api}>
        <FileInputFieldPortal container={inputFieldContainer}>
            <input
                type="file"
                name={instanceOptions.inputFieldName}
                multiple={multiple}
                capture={capture}
                accept={accept}
                webkitdirectory={webkitdirectory}
                style={{ display: "none" }}
                ref={inputFieldRef}/>
        </FileInputFieldPortal>
        {children}
    </UploadyContext.Provider>;
};

export default Uploady;
