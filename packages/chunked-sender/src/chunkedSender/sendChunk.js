// @flow

import { createBatchItem, logger } from "@rpldy/shared";
import send from "@rpldy/sender";
import { getChunkDataFromFile } from "../utils";

import type { BatchItem } from "@rpldy/shared";
import type { OnProgress, SendOptions, SendResult } from "@rpldy/sender";
import type { Chunk } from "./types";
import ChunkedSendError from "./ChunkedSendError";

const getContentRangeValue = (chunk, data, item) =>
    `bytes ${chunk.start}-${chunk.start + data.size - 1}/${item.file.size}`;

export default (
    chunk: Chunk,
    item: BatchItem,
    url: string,
    sendOptions: SendOptions,
    onProgress: OnProgress,
): SendResult => {
    if (!chunk.data) {
        //slice the chunk based on bit position
        chunk.data = getChunkDataFromFile(item.file, chunk.start, chunk.end);
    }

    if (!chunk.data) {
        throw new ChunkedSendError("chunk failure - failed to slice");
    }

    const data = chunk.data; //things we do for flow...
    const chunkItem = createBatchItem(data, chunk.id);

    logger.debugLog(`chunkedSender: about to send chunk ${chunk.id} [${chunk.start}-${chunk.end}] to: ${url}`);

    sendOptions = {
        ...sendOptions,
        headers: {
            ...sendOptions.headers,
            "Content-Range": getContentRangeValue(chunk, data, item),
        }
    };

    const onChunkProgress = (e) => {
        onProgress(e, [chunk]);
    };

    return send([chunkItem], url, sendOptions, onChunkProgress);
};
