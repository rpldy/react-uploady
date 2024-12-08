// @flow
import React, { forwardRef, useCallback, useRef } from "react";
import { markAsUploadOptionsComponent, useUploadyContext } from "@rpldy/shared-ui";

import type { ComponentType } from "react";
import type { UploadOptions } from "@rpldy/shared";
import type { UploadButtonProps } from "./types";

const asUploadButton = (Component: ComponentType<any>): React$ComponentType<UploadButtonProps> => {
    const AsUploadButton = (props: UploadButtonProps, ref: any) => {
        const { showFileUpload } = useUploadyContext();
        const { id, className, text, children, extraProps, onClick, ...uploadOptions } = props;

        //using ref so onButtonClick can stay memoized
        const uploadOptionsRef = useRef<?UploadOptions>();
        uploadOptionsRef.current = uploadOptions;

        const onButtonClick = useCallback((e: SyntheticMouseEvent<HTMLElement>) => {
            showFileUpload(uploadOptionsRef.current);
            onClick?.(e);
        }, [showFileUpload, uploadOptionsRef, onClick]);

        return <Component
            ref={ref}
            onClick={onButtonClick}
            id={id}
            className={className}
            {...extraProps}
        >
            {children || text || "Upload"}
        </Component>;
    };

    markAsUploadOptionsComponent(AsUploadButton);

    return forwardRef<UploadButtonProps, {current: null | React$ElementType} | ((null | React$ElementType) => mixed)>(AsUploadButton);
};

export default asUploadButton;
