import * as React from "react";
import { UploadOptions } from "@rpldy/shared";

export interface ButtonProps {
    className?: string;
    id?: string;
    children?: JSX.Element[] | JSX.Element;
    text?: string;
    extraProps?: object;
}

export interface UploadButtonProps extends ButtonProps, UploadOptions {}

export const UploadButton: React.ComponentType<UploadButtonProps>;

export const asUploadButton: <T>(component: React.ComponentType<T>) => React.FC;

export default UploadButton;
