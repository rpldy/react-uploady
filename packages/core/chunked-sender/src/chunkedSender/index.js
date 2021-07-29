// @flow
import { logger } from "@rpldy/shared";
import xhrSend from "@rpldy/sender";
import { getMandatoryOptions } from "../utils";
import processChunks from "./processChunks";

import type { BatchItem } from "@rpldy/shared";
import type { OnProgress, SendResult } from "@rpldy/sender";
import type { TriggerMethod } from "@rpldy/life-events";
import type { ChunkedOptions, ChunkedSender, ChunkedSendOptions } from "../types";

const createChunkedSender = (chunkedOptions: ?ChunkedOptions, trigger: TriggerMethod): ChunkedSender => {
    const options = getMandatoryOptions(chunkedOptions);

    const send = (items: BatchItem[], url: ?string, sendOptions: ChunkedSendOptions, onProgress: OnProgress): SendResult => {
        let result;

        if (!options.chunked || items.length > 1 || items[0].url || !items[0].file.size) {
            result = xhrSend(items, url, sendOptions, onProgress);
            logger.debugLog(`chunkedSender: sending items as normal, un-chunked requests`);
        } else {
            logger.debugLog(`chunkedSender: sending file as a chunked request`);
            result = processChunks(
                items[0],
                options,
                url,
                sendOptions,
                onProgress,
                trigger);
        }

        return result;
    };

    return {
        send,
    };
};

export default createChunkedSender;
