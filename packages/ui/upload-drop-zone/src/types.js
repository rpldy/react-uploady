// @flow
import type { UploadOptions } from "@rpldy/shared";

export type UploadDropZoneProps =  {|
	...UploadOptions,
	className?: string,
	id?: string,
    onDragOverClassName?: string,
    dropHandler?: (e: SyntheticDragEvent<HTMLDivElement>) => FileList | mixed[],
    htmlDirContentParams?: Object,
    children?: React$Node,
|};
