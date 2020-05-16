// @flow
import { logger, request } from "@rpldy/shared";
import { SUCCESS_CODES } from "./consts";

import type { BatchItem } from "@rpldy/shared";
import type { State, TusState, InitUploadResult  } from "./types";

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

const handleSuccessfulCreateResponse = (item: BatchItem, url: string, tusState: TusState, createResponse: XMLHttpRequest) => {
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

    return {
        offset: 0,
        uploadUrl,
        isNew: true,
    };
};

export default (item: BatchItem, url: string, tusState: TusState): InitUploadResult => {
    const { options } = tusState.getState();
    const headers = {
        "tus-resumable": options.version,
    };

    if (options.deferLength) {
        headers["Upload-Defer-Length"] = 1;
    } else {
        headers["Upload-Length"] = item.file.size;
    }

    logger.debugLog(`tusSender.create - creating upload for ${item.id} at: ${url}`);

    const pXhr = request(url, null, { method: "POST", headers });

    let createFinished = false;

    const createRequest = pXhr
        .then((createResponse) => {
            let result = null;

            if (createResponse && ~SUCCESS_CODES.indexOf(createResponse.status)) {
                result = handleSuccessfulCreateResponse(item, url, tusState, createResponse);
            } else {
                logger.debugLog(`tusSender.create: create upload failed for item: ${item.id}`, createResponse);
            }

            return result;
        })
        .catch((error) => {
            logger.debugLog(`tusSender.create: create upload failed`, error);
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
        request: createRequest,
        abort: abortCreate,
    };
};
