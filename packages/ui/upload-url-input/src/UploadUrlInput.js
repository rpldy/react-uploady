// @flow
import React, { useRef, useContext, useCallback, forwardRef } from "react";
import { invariant } from "@rpldy/shared";
import { UploadyContext, assertContext, useWithForwardRef } from "@rpldy/shared-ui";
import type { UploadOptions } from "@rpldy/shared";
import type { UploadUrlInputProps, UploadMethod } from "./types";

const UploadUrlInput = forwardRef<UploadUrlInputProps, ?HTMLInputElement>(
    (props: UploadUrlInputProps, ref) => {
        const { ref: inputRef, setRef: setInputRef } = useWithForwardRef<?HTMLInputElement>(ref);
        const context = assertContext(useContext(UploadyContext));

        const { className, id, placeholder, uploadRef, validate, ignoreKeyPress, ...uploadOptions } = props;

        //using ref so upload can stay memoized
        const uploadOptionsRef = useRef<?UploadOptions>();
        uploadOptionsRef.current = uploadOptions;

        const upload = useCallback(() => {

            invariant(
                inputRef.current,
                "Uploady - UploadUrlInput failed to upload, input ref isn't available"
            );

            const input = inputRef.current,
                value = input.value;

            if ((validate ? validate(value, input) : value)) {
                context.upload(value, uploadOptionsRef.current);
            }
        }, [
            context,
            validate,
            uploadOptionsRef,
            inputRef
        ]);

        const onKeyPress = useCallback((e: KeyboardEvent) => {
            if (!ignoreKeyPress && e.key === "Enter") {
                upload();
            }
        }, [upload, ignoreKeyPress]);

		const { setRef: setUploadMethodRef } = useWithForwardRef<UploadMethod>(uploadRef);
		setUploadMethodRef(upload);

        return <input
            type="text"
            id={id}
            ref={setInputRef}
            className={className}
            onKeyPress={onKeyPress}
            placeholder={placeholder}
        />;
    });

export default UploadUrlInput;
