import * as React from "react";
import { UploadOptions } from "@rpldy/shared";

export interface ButtonProps<E = Element> {
    className?: string;
    id?: string;
    children?: JSX.Element[] | JSX.Element | string;
    text?: string;
    extraProps?: Record<string, unknown>;
    ref?: React.RefObject<any>;
    onClick?: React.MouseEventHandler<E>
}

export interface UploadButtonProps<E = Element> extends ButtonProps<E>, UploadOptions {}

export const UploadButton: React.ComponentType<React.PropsWithRef<UploadButtonProps<HTMLButtonElement>>>;

export const asUploadButton: <T, E = Element>(component: React.ForwardRefExoticComponent<T> | React.ComponentType<T>) => React.FC<UploadButtonProps<E>>;

export default UploadButton;
