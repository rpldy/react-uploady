// @flow
import type { UploadOptions } from "@rpldy/shared";

export type DropHandlerMethod = (e: SyntheticDragEvent<HTMLDivElement>) => FileList | mixed[]

export type ShouldRemoveDragOverMethod = (e: SyntheticDragEvent<HTMLElement>) => boolean;

export type UploadDropZoneProps =  {|
	...UploadOptions,
	className?: string,
	id?: string,
    onDragOverClassName?: string,
    dropHandler?: DropHandlerMethod,
    htmlDirContentParams?: Object,
    shouldRemoveDragOver?: ShouldRemoveDragOverMethod,
    extraProps?: Object,
    children?: React$Node,
|};
