// @flow
import type { UploadOptions } from "@rpldy/shared";

export type GetFilesMethod = () => Promise<File[]>;

export type DropHandlerMethod = (e: SyntheticDragEvent<HTMLDivElement>, getFiles: GetFilesMethod) => FileList | mixed[]

export type ShouldHandleDragMethod = (e: SyntheticDragEvent<HTMLDivElement>) => boolean;

export type ShouldHandleDrag = boolean | ShouldHandleDragMethod;

export type ShouldRemoveDragOverMethod = (e: SyntheticDragEvent<HTMLElement>) => boolean;

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
    extraProps?: Object,
    children?: React$Node,
|};
