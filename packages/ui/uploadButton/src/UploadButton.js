// @flow
import React, { useContext } from "react";
import { UploadyContext, assertContext } from "@rupy/shared-ui";
import type { UploadButtonProps } from "../types";

//TODO : Should be able to override uploader options !!!!!!!!!!!

const UploadButton = (props: UploadButtonProps) => {
	const context = assertContext(useContext(UploadyContext));

	const { showFileUpload } = context;

	return <button id={props.id} className={props.className}
	               onClick={showFileUpload}>Upload</button>;
};

export default UploadButton;

