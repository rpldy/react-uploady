// @flow

import type { SendOptions } from "@rpldy/sender";
import type { UploadData } from "@rpldy/shared";
import { FILE_STATES } from "@rpldy/shared";

const getUploadMetadata = (sendOptions: SendOptions): void | string => {
	const keys = sendOptions.params && Object.keys(sendOptions.params);

	return keys?.length ?
		keys.map((name) => `${name} ${btoa(sendOptions.params[name])}`)
			.join(",") :
		undefined;
};

const addLocationToResponse = (request: Promise<UploadData>, location: ?string): Promise<UploadData> =>
    request.then((data: UploadData) => {
        if (data.state === FILE_STATES.FINISHED) {
            data.response.location = location;
        }

        return data;
    });

export {
	getUploadMetadata,
    addLocationToResponse
};
