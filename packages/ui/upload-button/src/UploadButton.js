// @flow
import React, { forwardRef } from "react";
import asUploadButton from "./asUploadButton";
import type { ComponentType } from "react";

const UploadButton = asUploadButton(forwardRef(
    (props: any, ref: React.RefSetter<HTMLElement> | ((null | HTMLButtonElement) => unknown)) =>
        <button ref={ref} {...props}/>)) as ComponentType<any>;

export default UploadButton;
