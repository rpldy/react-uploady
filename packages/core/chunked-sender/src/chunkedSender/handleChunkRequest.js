// @flow
import { FILE_STATES, logger, pick } from "@rpldy/shared";
import { unwrap } from "@rpldy/simple-state";
import { CHUNK_EVENTS } from "../consts";

import type { BatchItem } from "@rpldy/shared";
import type { SendResult } from "@rpldy/sender";
import type { TriggerMethod } from "@rpldy/life-events";
import type { State } from "./types";

const handleChunkRequest =  (state: State, item: BatchItem, chunkId: string, chunkSendResult: SendResult, trigger: TriggerMethod): Promise<void> => {
    state.requests[chunkId] = {
        id: chunkId,
        abort: chunkSendResult.abort,
    };

    return chunkSendResult.request
        .then((result) => {
            logger.debugLog(`chunkedSender: request finished for chunk: ${chunkId} - `, result);

            delete state.requests[chunkId];

            const index = state.chunks.findIndex((c) => c.id === chunkId);

            if (~index) {
                if (result.state === FILE_STATES.FINISHED) {
                    //remove chunk so eventually there are no more chunks to send
                    //TODO: splicing array is dangerous. Need to find a better (immutable) way to progress chunk upload
                    const spliced = state.chunks.splice(index, 1);

                    trigger(CHUNK_EVENTS.CHUNK_FINISH, {
                        chunk: pick(spliced[0], ["id", "start", "end", "index", "attempt"]),
                        item: unwrap(item),
                        uploadData: result,
                    });
                } else if (result.state !== FILE_STATES.ABORTED) {
                    //increment attempt in case chunk failed (and not aborted)
                    state.chunks[index].attempt += 1;
                }

                state.responses.push(result.response);
            }
        });
};

export default handleChunkRequest;
