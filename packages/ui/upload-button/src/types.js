// @flow

import type { Node } from "react";
import type { UploadOptions } from "@rpldy/shared";

export type UploadButtonProps = {|
    ...UploadOptions,
	className?: string,
	id?: string,
	children?: Node,
	text?: string
|};
