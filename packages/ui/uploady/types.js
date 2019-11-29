// @flow
import * as React from "react";
import type { Destination, UploaderType } from "@rupy/shared";

export type UploadyProps = {
	destination?: Destination,
	uploader?: UploaderType,
	inputFieldName?: string,
	debug?: boolean,
	listeners?: { [string]: Function },
	children: React.Node,
};