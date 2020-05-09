// @flow

import { logger } from "@rpldy/shared";
import xhrSend from "@rpldy/sender";
import { getMandatoryOptions } from "../utils";
import processChunks from "./processChunks";

import type { BatchItem } from "@rpldy/shared";
import type { OnProgress, SendOptions, SendResult } from "@rpldy/sender";
import type { ChunkedOptions, ChunkedSender } from "../types";
import addLife from "@rpldy/life-events";

export default (chunkedOptions: ?ChunkedOptions): ChunkedSender => {
    const options = getMandatoryOptions(chunkedOptions);

    const send = (items: BatchItem[], url: string, sendOptions: SendOptions, onProgress: OnProgress): SendResult => {
        let result;

        if (!options.chunked || items.length > 1 || items[0].url ||
            items[0].file.size <= options.chunkSize) {
            logger.debugLog(`ChunkedUploady.sender: sending items as normal, un-chunked requests`);
            result = xhrSend(items, url, sendOptions, onProgress);
        } else {
            logger.debugLog(`ChunkedUploady.sender: sending file as a chunked request`);
            result = processChunks(items[0], options, url, sendOptions, onProgress, trigger);
        }

        return result;
    };

    const { trigger, target: sender } = addLife({
        send,
    });

    return sender;
};
