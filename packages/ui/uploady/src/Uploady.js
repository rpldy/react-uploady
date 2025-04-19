// @flow
import React, { forwardRef, memo, useRef } from "react";
import ReactDOM from "react-dom";
import { invariant, hasWindow } from "@rpldy/shared";
import { NoDomUploady, useUploadOptions } from "@rpldy/shared-ui";

import type { Node } from "react";
import type { UploaderCreateOptions } from "@rpldy/uploader";
import type { UploadyProps } from "@rpldy/shared-ui";

type FileInputProps = {|
    multiple: boolean,
    capture?: ?(boolean | "user" | "environment"),
    accept: ?string,
    webkitdirectory?: boolean,
    id: ?string,
    style: Object,
|};

type FileInputPortalProps = {|
    ...FileInputProps,
    container: ?HTMLElement,
    noPortal: boolean,
|};

const NO_CONTAINER_ERROR_MSG = "Uploady - Container for file input must be a valid dom element";

const renderInput = (inputProps: FileInputProps, instanceOptions: UploaderCreateOptions, ref: React.RefSetter<HTMLInputElement>) => <input
    {...inputProps}
    name={instanceOptions.inputFieldName}
    type="file"
    ref={ref}
/>;

const renderInPortal = (
    container: ?HTMLElement,
    isValidContainer: ?boolean,
    inputProps: FileInputProps,
    instanceOptions: UploaderCreateOptions,
    ref: React.RefSetter<HTMLInputElement>
) =>
    container && isValidContainer ?
        ReactDOM.createPortal(renderInput(inputProps, instanceOptions, ref), container) :
        null;

const FileInputField = memo(forwardRef(({ container, noPortal, ...inputProps }: FileInputPortalProps, ref: React.RefSetter<HTMLInputElement>) => {
    const instanceOptions: UploaderCreateOptions = useUploadOptions();
    const isValidContainer = container && container.nodeType === 1;

    invariant(
        isValidContainer || !hasWindow(),
        NO_CONTAINER_ERROR_MSG
    );

    // In DEV - SSR React will warn on mismatch between client&server :( -
    // https://github.com/facebook/react/issues/12615
    // https://github.com/facebook/react/issues/13097
    return noPortal ?
        renderInput(inputProps, instanceOptions, ref) :
        renderInPortal(container, isValidContainer, inputProps, instanceOptions, ref);
}));

const Uploady = (props: UploadyProps): Node => {
    const {
        multiple = true,
        capture,
        accept,
        webkitdirectory,
        children,
        inputFieldContainer,
        customInput,
        fileInputId,
        noPortal  = false,
        ...noDomProps
    } = props;

    const container = !customInput ?
        (inputFieldContainer || (hasWindow() ? document.body : null)) : null;

    const internalInputFieldRef = useRef<?HTMLInputElement>();

    return <NoDomUploady {...noDomProps} inputRef={internalInputFieldRef}>
        {!customInput ? <FileInputField
            container={container}
            multiple={multiple}
            capture={capture}
            accept={accept}
            webkitdirectory={webkitdirectory ?? false}
            style={{ display: "none" }}
            ref={internalInputFieldRef}
            id={fileInputId}
            noPortal={noPortal}
        /> : null}

        {children}
    </NoDomUploady>;
};

export default Uploady;
