// @flow
import { logger, request } from "@rpldy/shared";
import { SUCCESS_CODES } from "./consts";

import type { BatchItem } from "@rpldy/shared";
import type { State, TusState } from "./types";
import type { SendOptions } from "@rpldy/sender";

export const resolveUploadUrl = (createUrl, location) => {
    let uploadUrl;

    if (/^(http:|https:)?\/\//.test(location)) {
        uploadUrl = location;
    } else {
        uploadUrl = [
            createUrl.replace(/\/$/, ""),
            location.replace(/^\//, "")
        ].join("/");
    }

    return uploadUrl;
};

const handleSuccessfulCreateResponse = (item: BatchItem, url: string, tusState: TusState, createResponse) => {
    const uploadUrl = resolveUploadUrl(url, createResponse.getResponseHeader("Location"));

    logger.debugLog(`tusSender.create - successfully created upload for item: ${item.id} - upload url = ${uploadUrl}`);

    tusState.updateState((state: State) => {
        //update state with create response for item (upload url)
        state.items[item.id] = {
            id: item.id,
            uploadUrl,
            size: item.file.size,
            offset: 0,
        };
    });
};

export default (item: BatchItem, url: string, tusState: TusState, sendOptions: SendOptions) => {
    const { options } = tusState.getState();
    const headers = {
        "tus-resumable": options.version,
    };

    if (options.deferLength) {
        headers["Upload-Defer-Length"] = 1;
    } else {
        headers["Upload-Length"] = item.file.size;
    }

    //TODO support "Upload-Metadata" header - get from sendOptions.params (might need to remove it from params before passing to chunked sender)
    //TODO: need to support https://tus.io/protocols/resumable-upload.html#creation-with-upload

    logger.debugLog(`tusSender.create - creating upload for ${item.id} at: ${url}`);

    const pXhr = request(url, null, { method: "POST", headers });

    let createFinished = false;

    const createRequest = pXhr
        .then((createResponse) => {
            let result = false;

            if (createResponse && ~SUCCESS_CODES.indexOf(createResponse.status)) {
                handleSuccessfulCreateResponse(item, url, tusState, createResponse);
                result = true;
            } else {
                logger.debugLog(`tusSender.create: create upload failed for item: ${item.id}`, createResponse);
            }

            return result;
        })
        .catch((error) => {
            logger.debugLog(`tusSender.create: create upload failed`, error);
            return false;
        })
        .finally(()=> {
            createFinished = true;
        });

    const abortCreate = () => {
        if (!createFinished) {
            logger.debugLog(`tusSender.create: aborting create request for item: ${item.id}`);
            pXhr.xhr.abort();
        }

        return !createFinished;
    };

    return {
        createRequest,
        abortCreate,
    };
};
