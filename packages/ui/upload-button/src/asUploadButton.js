// @flow
import React, { forwardRef, useCallback, useRef } from "react";
import { useUploadyContext } from "@rpldy/shared-ui";

import type { ComponentType } from "react";
import type { UploadOptions } from "@rpldy/shared";
import type { UploadButtonProps } from "./types";

export default (Component: ComponentType<any>) => {
    const AsUploadButton = (props: UploadButtonProps, ref) => {
        const { showFileUpload } = useUploadyContext();
        const { id, className, text, children, extraProps, onClick, ...uploadOptions } = props;

        //using ref so onButtonClick can stay memoized
        const uploadOptionsRef = useRef<?UploadOptions>();
        uploadOptionsRef.current = uploadOptions;

        const onButtonClick = useCallback((e) => {
            showFileUpload(uploadOptionsRef.current);
            onClick?.(e);
        }, [showFileUpload, uploadOptionsRef, onClick]);

        return <Component
            ref={ref}
            onClick={onButtonClick}
            id={id}
            className={className}
            children={children || text || "Upload"}
            {...extraProps}
        />;
    };

    return forwardRef<UploadButtonProps, mixed | React$ElementType>(AsUploadButton);
};

