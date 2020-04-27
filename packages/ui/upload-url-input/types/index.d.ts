import { UploadOptions } from "@rpldy/shared";
import * as React from "react";

export type ValidateMethod = (value: string | void, input: HTMLInputElement | void) => boolean;

export interface UploadUrlInputProps extends UploadOptions {
    className?: string;
    id?: string;
    placeholder?: string;
    validate?: ValidateMethod;
    uploadRef?: object;
    ignoreKeyPress?: boolean;
    ref?: React.RefObject<any>;
}

export const UploadUrlInput: (props: React.PropsWithRef<UploadUrlInputProps>) => JSX.Element;

export default UploadUrlInput;
