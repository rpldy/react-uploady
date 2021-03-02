// @flow
import React, { forwardRef, useCallback, useRef } from "react";
import { useUploady } from "@rpldy/shared-ui";

import type { ComponentType } from "react";
import type { UploadOptions } from "@rpldy/shared-ui";
import type { PasteProps } from "./types";

const withPaste = (Component: ComponentType<any>): React$AbstractComponent<PasteProps, mixed> => {
    const PasteComponent = (props: PasteProps, ref) => {
        const { id, className, children, onUploadPaste, extraProps, ...uploadOptions } = props;
        const { upload } = useUploady();

        //using ref so onPaste can stay memoized
        const uploadOptionsRef = useRef<?UploadOptions>();
        uploadOptionsRef.current = uploadOptions;

        const onPaste = useCallback((e) => {
            if (e.clipboardData?.files?.length) {
                upload(e.clipboardData.files, uploadOptionsRef.current);
            }
        }, [upload, uploadOptionsRef, onUploadPaste]);

        return <Component
            ref={ref}
            id={id}
            className={className}
            {...extraProps}
            onPaste={onPaste}
        >
            {children}
        </Component>;
    };

    return forwardRef<PasteProps, mixed | React$ElementType>(PasteComponent);
};

export default withPaste;
