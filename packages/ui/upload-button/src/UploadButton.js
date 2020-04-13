// @flow
import React, { forwardRef } from "react";
import asUploadButton from "./asUploadButton";

export default asUploadButton(forwardRef(
    (props, ref) =>
        <button ref={ref} {...props}/>));
