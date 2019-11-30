// @flow
import * as React from "react";
import type { Destination, UploadOptions} from "@rupy/shared";
import type { UploaderType, } from "@rupy/uploader";

export type  UploadyProps = UploadOptions & {
	destination?: Destination,
	uploader?: UploaderType,
	inputFieldName?: string,
	debug?: boolean,
	listeners?: { [string]: Function },
	children: React.Node,
};