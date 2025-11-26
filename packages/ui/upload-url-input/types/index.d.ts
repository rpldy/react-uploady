import { UploadOptions } from "@rpldy/shared";
import * as React from "react";

export type ValidateMethod = (value: string | undefined, input: HTMLInputElement | undefined) => boolean;

export type UploadMethod = () => void;

export interface UploadUrlInputProps extends UploadOptions {
    className?: string;
    id?: string;
    placeholder?: string;
    validate?: ValidateMethod;
    uploadRef?: React.RefObject<UploadMethod>;
    ignoreKeyPress?: boolean;
    ref?: React.RefObject<any>;
}

export const UploadUrlInput: (props: React.PropsWithRef<UploadUrlInputProps>) => React.JSX.Element;

export default UploadUrlInput;
