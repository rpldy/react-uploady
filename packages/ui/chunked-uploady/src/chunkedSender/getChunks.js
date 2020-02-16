// @flow

import type { BatchItem } from "@rpldy/shared";
import type { MandatoryChunkedOptions } from "../types";
import type { Chunk } from "./types";

export default (item: BatchItem, options: MandatoryChunkedOptions): Chunk[] => {
	const { chunkSize } = options,
		count = Math.ceil(item.file.size / chunkSize);

	return new Array(count).fill(null)
		.map((n, index) => {
			const start = (chunkSize * index);

			return {
				id: item.id + `_chunk-${index}`,
				start,
				end: Math.min((start + chunkSize), item.file.size),
				data: null,
				attempt: 0,
			};
		});
};
