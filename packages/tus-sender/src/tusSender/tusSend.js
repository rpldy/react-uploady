// @flow
import { getUpdateable, logger } from "@rpldy/shared";
import { CHUNKING_SUPPORT } from "@rpldy/chunked-sender";
import xhrSend from "@rpldy/sender";
import handleEvents from "./handleEvents";
import handleTusUpload from "./handleTusUpload";

import type { BatchItem } from "@rpldy/shared";
import type {
    ChunkedSender,
    OnProgress,
    SendOptions,
    SendResult,
} from "@rpldy/chunked-sender";
import type { UploaderType } from "@rpldy/uploader";
import type { TusOptions } from "../types";
import type { State, TusState } from "./types";
import { TUS_SENDER_TYPE } from "./consts";

const initializeState = (options: TusOptions): TusState => {
    const { state, update } = getUpdateable({
        options,
        items: {},
        //featureDetection
    });

    return {
        getState: (): State => state,
        updateState: update,
    };
};

export default (uploader: UploaderType, chunkedSender: ChunkedSender, options: TusOptions) => {
    const tusState = initializeState(options);

    handleEvents(tusState, chunkedSender);

    const tusSend = (
        items: BatchItem[],
        url: string,
        sendOptions: SendOptions,
        onProgress: OnProgress
    ): SendResult => {
        let result;

        if (items.length > 1 || items[0].url) {
            //ignore this upload - let the chunked sender handle it
            result = chunkedSender.send(items, url, sendOptions, onProgress);
        } else {
            //TUS only supports a single file upload (no grouping)
            logger.debugLog(`tusSender: sending file using TUS protocol`);
            const { request, abort } = handleTusUpload(items, url, sendOptions, onProgress, tusState, chunkedSender);

            result = {
                request,
                abort,
                senderType: TUS_SENDER_TYPE,
            };
        }

        return result;
    };

    return CHUNKING_SUPPORT ? tusSend : xhrSend;
};
