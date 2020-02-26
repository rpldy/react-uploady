// @flow
import React, { useCallback, useContext, useRef } from "react";
import { UploadyContext, assertContext } from "@rpldy/shared-ui";
import type { UploadOptions } from "@rpldy/shared";
import type { UploadButtonProps } from "./types";

const UploadButton = (props: UploadButtonProps) => {
    const context = assertContext(useContext(UploadyContext));

    const { showFileUpload } = context;
    const { id, className, text, children, ...uploadOptions } = props;

    //using ref so inputOnClick can stay memoized
    const uploadOptionsRef = useRef<?UploadOptions>();
    uploadOptionsRef.current = uploadOptions;

    const inputOnClick = useCallback(() => {
        showFileUpload(uploadOptionsRef.current);
    }, [showFileUpload, uploadOptionsRef]);

    return <button
        id={id}
        className={className}
        onClick={inputOnClick}>
        {children ? children : (text || "Upload")}
    </button>;
};

export default UploadButton;
