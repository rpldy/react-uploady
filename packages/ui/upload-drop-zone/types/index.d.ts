import * as React from "react";
import { UploadOptions } from "@rpldy/shared";

type DropResult = FileList | unknown[]

export type DropHandlerMethod = (e: DragEvent) => DropResult | Promise<DropResult>;

export interface UploadDropZoneProps extends UploadOptions {
    className?: string;
    id?: string;
    onDragOverClassName?: string;
    dropHandler?: DropHandlerMethod;
    htmlDirContentParams?: Record<string, unknown>;
    extraProps?: Record<string, unknown>;
    children?: JSX.Element | JSX.Element[];
}

export const UploadDropZone: React.ComponentType<UploadDropZoneProps>;

export default UploadDropZone;
