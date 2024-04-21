// @flow
import { logger, request } from "@rpldy/shared";
import { getChunkDataFromFile } from "@rpldy/chunked-sender";
import { SUCCESS_CODES } from "../../consts";
import { getUploadMetadata } from "../utils";

import type { BatchItem, FileLike } from "@rpldy/shared";
import type { SendOptions } from "@rpldy/sender";
import type { InitUploadResult  } from "../types";
import type { State, TusState } from "../../types";

export const resolveUploadUrl = (createUrl: string, location: string): string => {
    let uploadUrl;

    if (/^(http:|https:)?\/\//.test(location)) {
        uploadUrl = location;
    } else if (location.startsWith("/")) {
        //absolute location, concatenate to upload URL without any other path
        uploadUrl = (createUrl.startsWith("/") ?
            "" : new URL(createUrl).origin.replace(/\/$/, "")) + location;
    } else {
        uploadUrl = [
            createUrl.replace(/\/$/, ""),
            location.replace(/^\//, "")
        ].join("/");
    }

    return uploadUrl;
};

const handleSuccessfulCreateResponse = (item: BatchItem, url: string, tusState: TusState, createResponse: XMLHttpRequest, sentData: ?FileLike | Blob) => {
	const { options } = tusState.getState();
    const uploadUrl = resolveUploadUrl(url, createResponse.getResponseHeader("Location"));
	let offset = 0,
		isDone = false;

    logger.debugLog(`tusSender.create: successfully created upload for item: ${item.id} - upload url = ${uploadUrl}`);

    if (options.sendDataOnCreate) {
		const resOffset = parseInt(createResponse.getResponseHeader("Upload-Offset"));
		offset = !isNaN(resOffset) ? resOffset : offset;
		//consider as done when sending parallel chunk as part of the create
		isDone = +options.parallel > 1 && offset === sentData?.size;
	}

    tusState.updateState((state: State) => {
        //update state with create response for item
		state.items[item.id].uploadUrl = uploadUrl;
		state.items[item.id].offset = offset;
    });

    return {
        offset,
        uploadUrl,
        isNew: true,
		isDone
    };
};

const createUpload = (item: BatchItem, url: string, tusState: TusState, sendOptions: SendOptions, parallelIdentifier: ?string): InitUploadResult => {
    const { options } = tusState.getState();
    const headers = {
        "tus-resumable": options.version,
        "Upload-Defer-Length": options.deferLength ? 1 : undefined,
        "Upload-Length": !options.deferLength ? item.file.size : undefined,
        "Upload-Metadata": parallelIdentifier ? undefined : getUploadMetadata(sendOptions),
        "Content-Type": options.sendDataOnCreate ? "application/offset+octet-stream" : undefined,
        "Upload-Concat": parallelIdentifier ? "partial" : undefined,
        ...sendOptions.headers
    };

    let data = null;

    logger.debugLog(`tusSender.create - creating upload for ${item.id} at: ${url}`);

    if (options.sendDataOnCreate) {
        const chunkSize = +options.chunkSize;
        logger.debugLog(`tusSender.create - adding first chunk to create request`, { chunkSize, actualSize: item.file.size });

        data = chunkSize < item.file.size ?
            getChunkDataFromFile(item.file, 0, chunkSize) :
            item.file;
    }

    const pXhr = request(url, data, { method: "POST", headers });

    let createFinished = false;

    const createRequest = pXhr
        .then((createResponse) => {
            let result = null;

            if (createResponse && ~SUCCESS_CODES.indexOf(createResponse.status)) {
                result = handleSuccessfulCreateResponse(item, url, tusState, createResponse, data);
            } else {
                logger.debugLog(`tusSender.create: create upload failed for item: ${item.id}`, createResponse);
            }

            return result;
        })
        .catch((error) => {
            logger.debugLog(`tusSender.create: create upload failed`, error);
            //intentionally return null on error. handler will cope
            return null;
        })
        .finally(() => {
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

export default createUpload;
