// @flow
import ChunkedSendError from "./ChunkedSendError";
import type { State, Chunk } from "./types";

const getChunksToSend = (state: State): Array<Chunk> => {
    const chunks = [],
        inProgressIds = Object.keys(state.requests),
        parallel = state.parallel || 1;

    for (let i = 0; i < state.chunks.length &&
    inProgressIds.length < parallel &&
    chunks.length < parallel; i++) {
        const chunk = state.chunks[i];

        if (!inProgressIds.includes(chunk.id)) {
            if (!chunk.attempt || chunk.attempt < state.retries) {
                chunks.push(chunk);
            } else {
                throw new ChunkedSendError("chunk failure");
            }
        }
    }

    return chunks;
};

export default getChunksToSend;
