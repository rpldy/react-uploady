// @flow
import { logger, request } from "@rpldy/shared";
import { SUCCESS_CODES } from "./consts";

import type { BatchItem } from "@rpldy/shared";
import type { TusState } from "./types";
import type { SendOptions } from "@rpldy/sender";

export default async (item: BatchItem, url: string, tusState: TusState, sendOptions: SendOptions) => {
    let result = false;

    const { options } = tusState.getState();
    const headers = {};

    if (options.deferLength) {
        headers["Upload-Defer-Length"] = 1;
    } else {
        headers["Upload-Length"] = item.file.size;
    }

    //TODO support "Upload-Metadata" header - get from sendOptions.params (might need to remove it from params before passing to chunked sender)
    //TODO: need to support https://tus.io/protocols/resumable-upload.html#creation-with-upload

    logger.debugLog(`tusSender.create - creating upload for ${item.id} at: ${url}`);

    const createResponse = await request(url, null, { method: "POST", headers });

    if (~SUCCESS_CODES.indexOf(createResponse.status)) {
        const resLocation = createResponse.getHeader("Location");
        logger.debugLog(`tusSender.create - successfully created upload for item: ${item.id} - location = ${resLocation}`);

        //const uploadUrl = resolveUploadUrl(url, resLocation);


        //TODO: update state with create response for item (upload url)

        result = true;
    }

    return result;
};
