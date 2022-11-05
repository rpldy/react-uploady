import * as React from "react";
import { UploadOptions } from "@rpldy/shared";

type DropResult = FileList | unknown[]

export type GetFilesMethod = () => Promise<File[]>;

export type DropHandlerMethod = (e: DragEvent, getFiles: GetFilesMethod) => DropResult | Promise<DropResult>;

export type ShouldRemoveDragOverMethod = (e: DragEvent) => boolean;

export type ShouldHandleDragMethod = (e: DragEvent) => boolean;

export type ShouldHandleDrag = boolean | ShouldHandleDragMethod;

export interface UploadDropZoneProps extends UploadOptions {
    className?: string;
    id?: string;
    onDragOverClassName?: string;
    dropHandler?: DropHandlerMethod;
    htmlDirContentParams?: Record<string, unknown>;
    shouldRemoveDragOver?: ShouldRemoveDragOverMethod;
    shouldHandleDrag?: ShouldHandleDrag,
    extraProps?: Record<string, unknown>;
    children?: JSX.Element | JSX.Element[];
}

export const UploadDropZone: React.ComponentType<UploadDropZoneProps>;

export default UploadDropZone;
