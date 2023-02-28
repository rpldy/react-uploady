// @flow
import React, { forwardRef } from "react";
import asUploadButton from "./asUploadButton";

import type { ComponentType } from "react";

const UploadButton = (asUploadButton(forwardRef(
    (props, ref) =>
        <button ref={ref} {...props}/>)): ComponentType<any>);

export default UploadButton;
