// @flow
import React, { useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import { useUploadyContext } from "@rpldy/shared-ui";
import type { UploadOptions } from "@rpldy/shared";
import type { UploadUrlInputProps, UploadMethod } from "./types";

const UploadUrlInput = forwardRef<UploadUrlInputProps, ?HTMLInputElement>(
    (props: UploadUrlInputProps, ref) => {
        const inputRef = useRef<?HTMLInputElement>(null);
        const context = useUploadyContext();

        const { className, id, placeholder, uploadRef, validate, ignoreKeyPress, ...uploadOptions } = props;

        //using ref so upload can stay memoized
        const uploadOptionsRef = useRef<?UploadOptions>();
        uploadOptionsRef.current = uploadOptions;

        useImperativeHandle<?HTMLInputElement>(ref, () => inputRef.current, []);

        const upload = useCallback(() => {
            const input = inputRef.current,
                value = input?.value;

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

        useImperativeHandle<?UploadMethod>(uploadRef, () => upload, [upload]);

        return <input
            type="text"
            id={id}
            ref={inputRef}
            className={className}
            onKeyPress={onKeyPress}
            placeholder={placeholder}
        />;
    });

export default UploadUrlInput;
