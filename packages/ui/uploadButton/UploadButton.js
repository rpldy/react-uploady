// @flow
import React, { useContext, useCallback } from "react";
import { UploadyContext } from "@rupy/uploady";
import type { UploadButtonProps } from "./types";

const UploadButton = (props: UploadButtonProps) => {
	const { getInputField } = useContext(UploadyContext);

	const onButtonClick = useCallback(() => {
		const inputField = getInputField();
		inputField.click();
	}, [getInputField]);

	return <button onClick={onButtonClick}>Upload</button>;
};

export default UploadButton;

