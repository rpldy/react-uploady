// @flow
import ChunkedSendError from "./ChunkedSendError";

import type { BatchItem } from "@rpldy/shared";
import type { MandatoryChunkedOptions } from "../types";
import type { Chunk } from "./types";

export default (item: BatchItem, options: MandatoryChunkedOptions, startByte: ?number): Chunk[] => {
    const { chunkSize } = options;
    const size = startByte ? item.file.size - startByte : item.file.size;

    if (size <= 0) {
        throw new ChunkedSendError(`start byte ${startByte || 0} is invalid. File size: ${item.file.size}`);
    }

    const count = size <= chunkSize ? 1 :
        Math.ceil(size / chunkSize);

    return new Array(count).fill(null)
        .map((n, index) => {
            const start = (chunkSize * index) + (startByte || 0);

            return {
                id: `${item.id}_chunk-${index}`,
                start,
                end: Math.min((start + chunkSize), item.file.size),
                data: null,
                attempt: 0,
                uploaded: 0,
            };
        });
};
