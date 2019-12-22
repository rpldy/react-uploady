// @flow
import type { Node } from "react";
import type { Destination, UploadOptions } from "@rpldy/shared";
import type { UploaderEnhancer, UploaderType, } from "@rpldy/uploader";
import type { EventCallback } from "@rpldy/life-events";

export type UploadyProps = UploadOptions & {
	destination?: Destination,
	uploader?: UploaderType,
	enhancer?: UploaderEnhancer,
	inputFieldName?: string,
	debug?: boolean,
	listeners?: { [string]: EventCallback },
	children?: Node,
};