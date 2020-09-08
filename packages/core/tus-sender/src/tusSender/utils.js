// @flow

import type { SendOptions } from "@rpldy/sender";

const getUploadMetadata = (sendOptions: SendOptions) => {
	const keys = sendOptions.params && Object.keys(sendOptions.params);

	return keys?.length ?
		keys.map((name) => `${name} ${btoa(sendOptions.params[name])}`)
			.join(",") :
		undefined;
};

export {
	getUploadMetadata,
};