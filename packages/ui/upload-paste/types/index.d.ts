import * as React from "react";
import { UploadOptions } from "@rpldy/shared";

export type PasteUploadData = { count: number };

export type PasteUploadHandler = (data: PasteUploadData) => void;

export interface PasteCompProps {
    className?: string;
    id?: string;
    children?: JSX.Element[] | JSX.Element | string;
    extraProps?: Record<string, unknown>;
    onPasteUpload?: PasteUploadHandler,
}

export interface PasteProps extends UploadOptions, PasteCompProps {}

export type PasteUploadHookResult = { toggle: () => boolean, getIsEnabled: () => boolean};

export const usePasteUpload: (
    uploadOptions?: UploadOptions | null | undefined,
    element?: React.RefObject<HTMLHtmlElement> | null | undefined,
    onPasteUpload?: PasteUploadHandler
) => PasteUploadHookResult;

export const withPasteUpload: <T>(component: React.ForwardRefExoticComponent<T> | React.ComponentType<T>) => React.FC<PasteProps>;

export default withPasteUpload;
