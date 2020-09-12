// @flow
import React, { forwardRef, memo, useRef } from "react";
import ReactDOM from "react-dom";
import { invariant } from "@rpldy/shared";
import { NoDomUploady, useUploadOptions } from "@rpldy/shared-ui";

import type { UploadyProps } from "@rpldy/shared-ui";

type FileInputPortalProps = {|
    container: ?HTMLElement,
    multiple: boolean,
    capture: ?string,
    accept: ?string,
    webkitdirectory: ?boolean,
    id: ?string,
    style: Object,
|};

const NO_CONTAINER_ERROR_MSG = "Uploady - Container for file input must be a valid dom element";

const FileInputFieldPortal = memo(forwardRef((props: FileInputPortalProps, ref) => {
    const { container, ...inputProps } = props;
    const instanceOptions = useUploadOptions();
    const isValidContainer = container && container.nodeType === 1;

    invariant(
        isValidContainer,
        NO_CONTAINER_ERROR_MSG
    );

    return container && isValidContainer ? ReactDOM.createPortal(<input
        {...inputProps}
        name={instanceOptions.inputFieldName}
        type="file"
        ref={ref}
    />, container) : null;
}));

const Uploady = (props: UploadyProps) => {
    const {
        multiple = true,
        capture,
        accept,
        webkitdirectory,
        children,
        inputFieldContainer,
        customInput,
        fileInputId,
        ...noDomProps
    } = props;

    const container = !customInput ? (inputFieldContainer || document.body) : null;
    const internalInputFieldRef = useRef<?HTMLInputElement>();

    return <NoDomUploady {...noDomProps} inputRef={internalInputFieldRef}>
        {!customInput ? <FileInputFieldPortal
            container={container}
            multiple={multiple}
            capture={capture}
            accept={accept}
            webkitdirectory={webkitdirectory}
            style={{ display: "none" }}
            ref={internalInputFieldRef}
            id={fileInputId}
        /> : null}

        {children}
    </NoDomUploady>;
};

export default Uploady;
