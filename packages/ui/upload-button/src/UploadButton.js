// @flow
import React, { forwardRef } from "react";
import asUploadButton from "./asUploadButton";

const Button = (props, ref) =>
    <button ref={ref} {...props}/>;

export default asUploadButton(forwardRef(Button));
