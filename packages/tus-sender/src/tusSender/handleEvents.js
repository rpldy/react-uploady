// @flow
import { FILE_STATES, logger } from "@rpldy/shared";
import { UPLOADER_EVENTS } from "@rpldy/uploader";
import { CHUNKING_SUPPORT, CHUNK_EVENTS, } from "@rpldy/chunked-sender";
import initTusUpload from "./initTusUpload";
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

		chunkedSender.on(CHUNK_EVENTS.CHUNK_START,
			async ({ item, chunk, chunkItem, chunkIndex, chunkCount, url, sendOptions, onProgress }: ChunkStartEventData) => {

				let skipChunk = false;
				let itemInfo, headers;

				const { options } = tusState.getState(),
					isParallel = options.parallel > 1;

				if (isParallel) {
					const initResult = initTusUpload(
						[chunkItem],
						url,
						{
							...sendOptions,
							//params will be sent as metadata with the finalizing request
							params: null,
						},
						onProgress,
						tusState,
						chunkedSender,
						`_prlChunk_${options.chunkSize}_${chunkIndex}`
					);

					const response = await initResult.request;
					console.log("!!!!!!!!!!!!! parallel init response !!!!!!!!!!!!! ", response);

					if (response.state === FILE_STATES.FINISHED) {
						skipChunk = true;
					}
				}

				if (!skipChunk) {
					//get updated state because on parallel new info might have been added to state
					itemInfo = tusState.getState().items[isParallel ? chunkItem.id : item.id];

					const offset = isParallel ? 0 : (itemInfo.offset || chunk.start);

					headers = {
						"tus-resumable": options.version,
						"Upload-Offset": offset,
						"Content-Type": "application/offset+octet-stream",
						//TUS doesnt expect content-range header and may not whitelist for CORS
						"Content-Range": undefined,
						"X-HTTP-Method-Override": options.overrideMethod ? PATCH : undefined,
						//for deferred length, send the file size header with the last chunk
						"Upload-Length": options.deferLength && (chunkIndex === (chunkCount - 1)) ? item.file.size : undefined,
						"Upload-Concat": isParallel ? "partial" : undefined,
					};

					logger.debugLog(`tusSender.handleEvents: chunk start handler. offset = ${offset}`, {
						headers,
						url: itemInfo.uploadUrl
					});
				}

				return skipChunk ? false : {
					sendOptions: {
						sendWithFormData: false,
						method: options.overrideMethod ? "POST" : PATCH,
						headers,
					},
					url: itemInfo.uploadUrl,
				};
			});

		chunkedSender.on(CHUNK_EVENTS.CHUNK_FINISH, ({ item, chunk, uploadData }: ChunkFinishEventData) => {
			const { items, options } = tusState.getState();

			if (!options.parallel && items[item.id]) {
				const { status, response } = uploadData;
				logger.debugLog(`tusSender.handleEvents: received upload response (code: ${status}) for : ${item.id}, chunk: ${chunk.id}`, response);

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
