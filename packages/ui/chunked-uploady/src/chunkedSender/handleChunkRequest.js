// @flow
import { FILE_STATES, logger } from "@rpldy/shared";

import type { SendResult } from "@rpldy/shared";
import type { State } from "./types";

export default async (state: State, chunkId: string, chunkSendResult: SendResult) => {
	state.requests[chunkId] = {
		id: chunkId,
		abort: chunkSendResult.abort,
	};

	const result = await chunkSendResult.request;
	logger.debugLog(`chunkedSender: request finished for chunk: ${chunkId} - `, result);

	delete state.requests[chunkId];

	const index = state.chunks.findIndex((c) => c.id === chunkId);

	if (~index) {
		if (result.state === FILE_STATES.FINISHED) {
			//remove chunk so eventually there are no more chunks to send
			state.chunks.splice(index, 1);
		} else if (result.state !== FILE_STATES.ABORTED) {
			//increment attempt in case chunk failed (and not aborted)
			state.chunks[index].attempt += 1;
		}

		state.responses.push(result.response);
	}
};