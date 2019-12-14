// @flow
import type { Node } from "react";
import type { Destination, UploadOptions } from "@rupy/shared";
import type { UploaderEnhancer, UploaderType, } from "@rupy/uploader";

export type UploadyProps = UploadOptions & {
	destination?: Destination,
	uploader?: UploaderType,
	enhancer?: UploaderEnhancer,
	inputFieldName?: string,
	debug?: boolean,
	listeners?: { [string]: Function },
	children?: Node,
};