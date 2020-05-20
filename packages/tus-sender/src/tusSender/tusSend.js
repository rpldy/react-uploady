// @flow
import { logger } from "@rpldy/shared";
import { CHUNKING_SUPPORT } from "@rpldy/chunked-sender";
import xhrSend from "@rpldy/sender";
import initTusUpload from "./initTusUpload";
// import handleTusUpload from "./handleTusUpload";

import type { BatchItem } from "@rpldy/shared";
import type {
    ChunkedSender,
    OnProgress,
    SendOptions,
    SendResult,
} from "@rpldy/chunked-sender";
import type { TusState } from "./types";
import { TUS_SENDER_TYPE } from "./consts";

export default (chunkedSender: ChunkedSender, tusState: TusState) => {
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
            const { request, abort } = initTusUpload(items, url, sendOptions, onProgress, tusState, chunkedSender);

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
