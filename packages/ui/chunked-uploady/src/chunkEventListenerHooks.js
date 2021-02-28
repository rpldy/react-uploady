// @flow
import { generateUploaderEventHook } from "@rpldy/shared-ui";
import { CHUNK_EVENTS } from "@rpldy/chunked-sender";

const useChunkStartListener: any = generateUploaderEventHook(CHUNK_EVENTS.CHUNK_START, false);

const useChunkFinishListener: any = generateUploaderEventHook(CHUNK_EVENTS.CHUNK_FINISH, false);

export {
	useChunkStartListener,
	useChunkFinishListener,
};
