// @flow

import type { FileState } from "@rupy/shared";
import type { MockOptions, SendResult } from "../../types";

export default (options?: MockOptions) => {

	const update = (updated: MockOptions) => {

	};

	const send = (): SendResult => {

		return {
			// request: processResponse(request.pXhr, options),
			// abort: () => request.xhr.abort(),
		};
	};

	return {
		send,
		update,
	};
};