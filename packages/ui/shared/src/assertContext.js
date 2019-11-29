// @flow

import type { UploadyContextType } from "@rupy/uploady";

export default (context: ?UploadyContextType) : UploadyContextType => {
	if (!context || !context.uploader) {
		throw new Error("Uploady - valid UploadyContext not found. Make sure you render inside <Uploady>");
	}

	return context;
};