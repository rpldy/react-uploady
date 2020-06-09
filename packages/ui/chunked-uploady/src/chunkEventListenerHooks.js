// @flow
import { generateUploaderEventHook } from "@rpldy/shared-ui";
import { CHUNK_EVENTS } from "@rpldy/chunked-sender";

const useChunkStartListener = generateUploaderEventHook(CHUNK_EVENTS.CHUNK_START);

const useChunkFinishListener = generateUploaderEventHook(CHUNK_EVENTS.CHUNK_FINISH);

export {
	useChunkStartListener,
	useChunkFinishListener,
};
