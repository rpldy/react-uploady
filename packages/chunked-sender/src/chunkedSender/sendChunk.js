// @flow
import { triggerUpdater, createBatchItem, logger, merge, pick } from "@rpldy/shared";
import xhrSend from "@rpldy/sender";
import { getChunkDataFromFile } from "../utils";
import { CHUNK_EVENTS } from "../consts";
import type { BatchItem } from "@rpldy/shared";
import type { OnProgress, SendOptions, SendResult } from "@rpldy/sender";
import type { TriggerMethod } from "@rpldy/life-events";
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
    trigger: TriggerMethod,
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

    const updatedSendOptionsPromise = triggerUpdater(trigger, CHUNK_EVENTS.CHUNK_START, { chunk: pick(chunk, ["id", "start", "end"]), sendOptions, url });

    const xhrResult = updatedSendOptionsPromise
        .then((updated) => xhrSend(
            [chunkItem],
            updated.url || url,
            merge({}, sendOptions, updated.sendOptions),
            onChunkProgress));

    const abort = () => {
        xhrResult.then(({ abort }) => abort());
        //confirm abort was/be called
        return true;
    };

    return {
        //wrap with another promise since we need to wait for the trigger updater promise too
        request: new Promise((resolve) => xhrResult.then(resolve)),
        abort,
    };
};
