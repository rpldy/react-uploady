// @flow
import { logger } from "@rpldy/shared";
import { UPLOADER_EVENTS } from "@rpldy/uploader";
import { CHUNKING_SUPPORT, CHUNK_EVENTS, } from "@rpldy/chunked-sender";
import { SUCCESS_CODES } from "./consts";

import type {
	ChunkedSender,
	ChunkStartEventData,
	ChunkFinishEventData
} from "@rpldy/chunked-sender";
import type { TusState, State } from "./types";
import type { UploaderType } from "@rpldy/uploader";

const PATCH = "PATCH";

export default (uploader: UploaderType, tusState: TusState, chunkedSender: ChunkedSender) => {

	if (CHUNKING_SUPPORT) {
		uploader.on(UPLOADER_EVENTS.ITEM_FINALIZE, (item) => {
			if (tusState.getState().items[item.id]) {
				logger.debugLog(`tusSender.handleEvents: item ${item.id} finalized (${item.state}). Removing from state`);

				tusState.updateState((state: State) => {
					delete state.items[item.id];
				});
			}
		});

		chunkedSender.on(CHUNK_EVENTS.CHUNK_START, ({ item, chunk, chunkIndex, chunkCount }: ChunkStartEventData) => {

			//TODO: add relevant headers when tusState.getState().options.parallel > 1
			//"Upload-Concat": "partial"

			const { items, options } = tusState.getState(),
				itemInfo = items[item.id],
				headers = {
					"tus-resumable": options.version,
					//use chunk.start in case of parallel
					"Upload-Offset": itemInfo.offset || chunk.start,
					"Content-Type": "application/offset+octet-stream",
					//TUS doesnt expect content-range header and may not whitelist for CORS
					"Content-Range": undefined,
					"X-HTTP-Method-Override": options.overrideMethod ? PATCH : undefined,
					//for deferred length, send the file size header with the last chunk
					"Upload-Length": options.deferLength && (chunkIndex === (chunkCount -1)) ? item.file.size : undefined
				};

			logger.debugLog(`tusSender.handleEvents: chunk start handler - chunk start = ${chunk.start}, tus offset = ${itemInfo.offset}`);

			return {
				sendOptions: {
					sendWithFormData: false,
					method: options.overrideMethod ? "POST" : PATCH,
					headers,
				},
				url: itemInfo.uploadUrl,
			};
		});

		chunkedSender.on(CHUNK_EVENTS.CHUNK_FINISH, ({ item, chunk, uploadData }: ChunkFinishEventData) => {
			const { status, response } = uploadData;
			logger.debugLog(`tusSender.handleEvents: received upload response (code: ${status}) for : ${item.id}, chunk: ${chunk.id}`, response);

			if (tusState.getState().items[item.id]) {
				if (~SUCCESS_CODES.indexOf(status) && response.headers) {
					tusState.updateState((state: State) => {
						const data = state.items[item.id];
						data.offset = response.headers["upload-offset"];
					});
				}
			}
		});
	}
};
