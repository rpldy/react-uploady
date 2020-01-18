// @flow

import type { UploadyContextType } from "@rpldy/uploady";

export const ERROR_MSG = "Uploady - valid UploadyContext not found. Make sure you render inside <Uploady>";

export default (context: ?UploadyContextType) : UploadyContextType => {
	if (!context || !context.uploader) {
		throw new Error(ERROR_MSG);
	}

	return context;
};