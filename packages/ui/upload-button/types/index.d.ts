import * as React from "react";
import { UploadOptions } from "@rpldy/shared";

export interface ButtonProps {
    className?: string;
    id?: string;
    children?: JSX.Element[] | JSX.Element | string;
    text?: string;
    extraProps?: Record<string, unknown>;
    ref?: React.RefObject<any>;
}

export interface UploadButtonProps extends ButtonProps, UploadOptions {}

export const UploadButton: React.ComponentType<React.PropsWithRef<UploadButtonProps>>;

export const asUploadButton:
    <T>(component: React.ForwardRefExoticComponent<T> | React.ComponentType<T>) => React.FC<UploadButtonProps>;

export default UploadButton;
