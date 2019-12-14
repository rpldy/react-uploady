// @flow
import React, { useRef, useContext, useCallback } from "react";
import { isFunction } from "@rpldy/shared";
import { UploadyContext, assertContext } from "@rpldy/shared-ui";
import type { UploadUrlInputProps } from "../types";

const UploadUrlInput = (props: UploadUrlInputProps) => {
	const inputRef = useRef<?HTMLInputElement>(null);
	const context = assertContext(useContext(UploadyContext));

	const { className, id, placeholder, uploadRef, validate, ...uploadOptions } = props;

	const deps = [
		context.upload,
		validate,
		inputRef.current,
		...Object.values(uploadOptions)
	];

	const upload = useCallback(() => {
		if (inputRef && inputRef.current) {
			const value = inputRef.current.value;

			if ((validate ? validate(value, (inputRef && inputRef.current)) : value)) {
				context.upload(value, uploadOptions);
			}
		}
	}, deps);

	const onKeyPress = useCallback((e: KeyboardEvent) => {
		if (e.key === "Enter") {
			upload();
		}
	}, [upload]);

	if (uploadRef) {
		if (isFunction(uploadRef)) {
			uploadRef(upload);
		} else {
			uploadRef.current = upload;
		}
	}

	return <input
		type="text"
		id={id}
		ref={inputRef}
		className={className}
		onKeyPress={onKeyPress}
		placeholder={placeholder}/>;
};

export default UploadUrlInput;