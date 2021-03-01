// @flow
import { generateUploaderEventHook } from "@rpldy/shared-ui";
import { CHUNK_EVENTS } from "@rpldy/chunked-sender";

import type { ChunkStartListenerHook, ChunkFinishListenerHook } from "./types";

const useChunkStartListener: ChunkStartListenerHook = generateUploaderEventHook(CHUNK_EVENTS.CHUNK_START, false);

const useChunkFinishListener: ChunkFinishListenerHook = generateUploaderEventHook(CHUNK_EVENTS.CHUNK_FINISH, false);

export {
	useChunkStartListener,
	useChunkFinishListener,
};
