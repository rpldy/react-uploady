// @flow
import React, { useContext } from "react";
import { UploadyContext, assertContext } from "@rpldy/shared-ui";
import type { UploadButtonProps } from "./types";

//TODO : Should be able to override uploader options !!!!!!!!!!!

const UploadButton = (props: UploadButtonProps) => {
	const context = assertContext(useContext(UploadyContext));

	const { showFileUpload } = context;
	const { id, className, text, children } = props;

	return <button
		id={id}
		className={className}
		onClick={showFileUpload}>
		{children ? children : (text || "Upload")}
	</button>;
};

export default UploadButton;

