// @flow
import React, { forwardRef, useCallback, useContext, useRef } from "react";
import { assertContext, UploadyContext, useWithForwardRef } from "@rpldy/shared-ui";

import type { ComponentType } from "react";
import type { UploadOptions } from "@rpldy/shared";
import type { UploadButtonProps } from "./types";

export default (Component: ComponentType<any>) => forwardRef<UploadButtonProps, ?any>(
    (props: UploadButtonProps, ref) => {

        const { showFileUpload } = assertContext(useContext(UploadyContext));
        const { setRef: setButtonRef } = useWithForwardRef(ref);
        const { id, className, text, children, extraProps, ...uploadOptions } = props;

        //using ref so inputOnClick can stay memoized
        const uploadOptionsRef = useRef<?UploadOptions>();
        uploadOptionsRef.current = uploadOptions;

        const onButtonClick = useCallback(() => {
            showFileUpload(uploadOptionsRef.current);
        }, [showFileUpload, uploadOptionsRef]);

        return <Component
            ref={setButtonRef}
            onClick={onButtonClick}
            id={id}
            className={className}
            children={children || text || "Upload"}
            {...extraProps}
        />;
    });

