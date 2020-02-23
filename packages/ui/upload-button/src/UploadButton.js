// @flow
import React, { useCallback, useContext, memo } from "react";
import { UploadyContext, assertContext } from "@rpldy/shared-ui";
import type { UploadButtonProps } from "./types";

const UploadButton = (props: UploadButtonProps) => {
    const context = assertContext(useContext(UploadyContext));

    const { showFileUpload } = context;
    const { id, className, text, children, ...uploadOptions } = props;

    const inputOnClick = useCallback(() => {
        showFileUpload(uploadOptions);
    }, [showFileUpload, uploadOptions]);

    return <button
        id={id}
        className={className}
        onClick={inputOnClick}>
        {children ? children : (text || "Upload")}
    </button>;
};

export default memo(UploadButton);

