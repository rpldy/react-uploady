// @flow
import type { UploadOptions } from "@rpldy/shared";

export type GetFilesMethod = () => Promise<File[]>;

export type DropHandlerMethod = (e: React.DragEvent<HTMLDivElement>, getFiles: GetFilesMethod) => FileList | unknown[]

export type ShouldHandleDragMethod = (e: React.DragEvent<HTMLDivElement>) => boolean;

export type ShouldHandleDrag = boolean | ShouldHandleDragMethod;

export type ShouldRemoveDragOverMethod = (e: React.DragEvent<HTMLElement>) => boolean;

export type UploadDropZoneProps =  {|
	...UploadOptions,
	className?: string,
	id?: string,
    onDragOverClassName?: string,
    dropHandler?: DropHandlerMethod,
    htmlDirContentParams?: Object,
    shouldRemoveDragOver?: ShouldRemoveDragOverMethod,
    shouldHandleDrag?: ShouldHandleDrag,
    enableOnContains?: boolean,
    noContainCheckForDrag?: boolean,
    extraProps?: any,
    children?: React.Node,
|};
