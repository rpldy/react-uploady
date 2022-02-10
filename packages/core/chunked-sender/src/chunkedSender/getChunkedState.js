// @flow
import createState from "@rpldy/simple-state";

import type { ChunkedSendOptions, MandatoryChunkedOptions } from "../types";
import type { Chunk, ChunkedState, State } from "./types";

const getChunkedState = (
    chunks: Chunk[],
    url: ?string,
    sendOptions: ChunkedSendOptions,
    chunkedOptions: MandatoryChunkedOptions
): ChunkedState => {
    const { state, update } = createState<State>({
        finished: false,
        aborted: false,
        error: false,
        uploaded: {},
        requests: {},
        responses: [],
        chunkCount: chunks.length,
        startByte: sendOptions.startByte || 0,
        chunks,
        url,
        sendOptions,
        ...chunkedOptions,
    });

    const getState = (): State => state;

    const updateState = (updater: (State) => void) => {
        update(updater);
    };

    return {
        getState,
        updateState,
    };
};

export default getChunkedState;
