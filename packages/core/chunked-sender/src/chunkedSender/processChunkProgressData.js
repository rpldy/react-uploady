// @flow
import type { BatchItem } from "@rpldy/shared";
import type { ChunkedState } from "./types";

const processChunkProgressData = (chunkedState: ChunkedState, item: BatchItem, chunkId: string, chunkUploaded: number):
    { loaded: number, total: number } => {
    chunkedState.updateState((state) => {
        state.uploaded[chunkId] = Math.max(chunkUploaded, (state.uploaded[chunkId] || 0));
    });

    const state = chunkedState.getState();

    const loadedSum = Object.keys(state.uploaded)
        .reduce((res, id) => res + state.uploaded[id],
            //we start from the offset of the first chunk to get an accurate progress on resumed uploads
            state.startByte);

    const total = item.file.size;

    return { loaded: Math.min(loadedSum, total), total };
};

export default processChunkProgressData;
