/* eslint jest/no-conditional-expect: 0 */
import { UPLOADER_EVENTS } from "@rpldy/uploader";
import { CHUNK_EVENTS as mockChunkEvents } from "@rpldy/chunked-sender";
import getTusState from "../../tests/tusState.mock";
import { FILE_STATES } from "@rpldy/shared";

describe("handleEvents tests", () => {
	let handleEvents;

	const uploader = {
		on: jest.fn(),
	};

	const chunkedSender = {
		on: jest.fn(),
	};

	beforeEach(() => {
		clearJestMocks(
			uploader,
			chunkedSender,
		);
	});

	describe("no chunk support", () => {
		beforeAll(() => {
			jest.resetModules();
			jest.mock("@rpldy/chunked-sender", () => ({
				CHUNK_EVENTS: mockChunkEvents,
				CHUNKING_SUPPORT: false,
			}));

			handleEvents = require("../handleEvents").default;
		});

		it("should do nothing with no chunk support", () => {
			handleEvents(uploader, null, chunkedSender);
			expect(uploader.on).not.toHaveBeenCalled();
			expect(chunkedSender.on).not.toHaveBeenCalled();
		});
	});

	describe("with chunk support", () => {
		const mockRemoveResueable = jest.fn(),
			mockInitTus = jest.fn();

		beforeAll(() => {
			jest.resetModules();

			jest.mock("@rpldy/chunked-sender", () => ({
				CHUNK_EVENTS: mockChunkEvents,
				CHUNKING_SUPPORT: true,
			}));

			jest.mock("../../resumableStore", ()=>({
				removeResumable: mockRemoveResueable,
			}));

			jest.mock("../initTusUpload", () => mockInitTus);

			handleEvents = require("../handleEvents").default;
		});

		beforeEach(() => {
			clearJestMocks(
				mockRemoveResueable
			);
		});

		describe("uploader ITEM_FINALIZE tests", () => {
			it("should clean up after ITEM_FINALIZE", () => {
				const tusState = getTusState({
					items: {
						"i1": {
							offset: 0,
							parallelChunks: []
						}
					}
				});

				uploader.on.mockImplementationOnce((name, cb) => {
					cb({ id: "i1" });
					expect(tusState.getState().items.i1).toBeUndefined();
					expect(mockRemoveResueable).not.toHaveBeenCalled();
				});

				handleEvents(uploader, tusState, chunkedSender);
				expect(uploader.on).toHaveBeenCalledWith(UPLOADER_EVENTS.ITEM_FINALIZE, expect.any(Function));
			});

			it("should delete linked parallelChunks from state", () => {
				const tusState = getTusState({
					items: {
						"i1": {
							id: "i1",
							parallelChunks: ["i1-c1", "i1-c2"],
						},
						"i1-c1": {id: "i1-c1"},
						"i1-c2": {id: "i1-c2"},
						"i2-c1": {id: "i2-c1"},
					}
				});

				uploader.on.mockImplementationOnce((name, cb) => {
					cb({ id: "i1" });
					expect(tusState.getState().items.i1).toBeUndefined();
					expect(tusState.getState().items["i1-c1"]).toBeUndefined();
					expect(tusState.getState().items["i1-c2"]).toBeUndefined();
					expect(tusState.getState().items["i2-c1"]).toBeDefined();
				});

				handleEvents(uploader, tusState, chunkedSender);
				expect(uploader.on).toHaveBeenCalledWith(UPLOADER_EVENTS.ITEM_FINALIZE, expect.any(Function));
			});

			it("should do nothing for ITEM_FINALIZE if item not found", () => {
				const tusState = getTusState({ items: {} });

				uploader.on.mockImplementationOnce((name, cb) => {
					cb({ id: "i1" });
					expect(tusState.updateState).not.toHaveBeenCalled();
				});

				handleEvents(uploader, tusState, chunkedSender);
				expect(uploader.on).toHaveBeenCalled();
			});

			it("should remove storage url for forgetOnSuccess", () => {
				const item = {
					offset: 0,
					parallelChunks: []
				};

				const tusState = getTusState({
					items: {
						"i1": item,
					},
					options: {
						forgetOnSuccess: true
					}
				});

				uploader.on.mockImplementationOnce((name, cb) => {
					if (name === UPLOADER_EVENTS.ITEM_FINALIZE) {
						cb({ id: "i1" });
						expect(tusState.getState().items.i1).toBeUndefined();
						expect(mockRemoveResueable).toHaveBeenCalledWith({ id: "i1" }, tusState.getState().options);
					}
				});

				handleEvents(uploader, tusState, chunkedSender);
				expect(uploader.on).toHaveBeenCalledWith(UPLOADER_EVENTS.ITEM_FINALIZE, expect.any(Function));
			});
		});

		describe("uploader CHUNK_FINISH tests", () => {
			it.each([
				false,
				true
			])("should handle CHUNK_FINISH event for success = %s chunk upload", (success) => {
				const tusState = getTusState({
					items: {
						"i1": {
							offset: 0,
							test: 111
						}
					}
				});

				uploader.on.mockImplementation((name, cb) => {
					if (name === mockChunkEvents.CHUNK_FINISH) {
						cb({
							chunk: {},
							item: { id: "i1" },
							uploadData: {
								status: success ? 200 : 400,
								response: {
									headers: {
										"upload-offset": 123
									}
								}
							}
						});

						expect(tusState.getState().items["i1"].offset).toBe((success ? 123 : 0));
					}
				});

				handleEvents(uploader, tusState, chunkedSender);

				expect(uploader.on).toHaveBeenCalledWith(mockChunkEvents.CHUNK_FINISH, expect.any(Function));
			});

			it("should handle CHUNK_FINISH and do nothing if item not found", () => {
				const tusState = getTusState({ items: {} });

				uploader.on.mockImplementation((name, cb) => {
					if (name === mockChunkEvents.CHUNK_FINISH) {
						cb({
							chunk: {},
							item: { id: "i1" },
							uploadData: {}
						});

						expect(tusState.updateState).not.toHaveBeenCalled();
					}
				});

				handleEvents(uploader, tusState, chunkedSender);

				expect(uploader.on).toHaveBeenCalledWith(mockChunkEvents.CHUNK_FINISH, expect.any(Function));
			});

			it("should remove parallel chunk storage url for forgetOnSuccess", () => {

				const tusState = getTusState({
					items: {
						"i1": {
							offset: 0,
							parallelChunks: []
						}
					},
					options: {
						chunkSize: 124,
						parallel: 2,
						forgetOnSuccess: true,
					}
				});

				uploader.on.mockImplementation((name, cb) => {
					if (name === mockChunkEvents.CHUNK_FINISH) {
						const data = {
							chunk: {index: 1},
							item: { id: "i1" },
						};

						cb(data);

						expect(mockRemoveResueable)
							.toHaveBeenCalledWith(data.item, tusState.getState().options, `_prlChunk_124_1`);
					}
				});

				handleEvents(uploader, tusState, chunkedSender);

				expect(uploader.on).toHaveBeenCalled();
			});

			it("should do nothing for parallel", () => {

				const tusState = getTusState({
					items: {
						"i1": {
							offset: 0,
							parallelChunks: []
						}
					},
					options: {
						chunkSize: 124,
						parallel: 2,
					}
				});

				uploader.on.mockImplementation((name, cb) => {
					if (name === mockChunkEvents.CHUNK_FINISH) {
						const data = {
							chunk: {index: 1},
							item: { id: "i1" },
						};

						cb(data);
						expect(tusState.updateState).not.toHaveBeenCalled();
						expect(mockRemoveResueable).not.toHaveBeenCalled();
					}
				});

				handleEvents(uploader, tusState, chunkedSender);

				expect(uploader.on).toHaveBeenCalled();
			});
		});

		describe("chunkedSender CHUNK_START tests", () => {

			it("should update send options for chunk using stored offset", () => {

				const tusState = getTusState({
					items: {
						"i1": {
							offset: 123,
							uploadUrl: "upload.url"
						}
					}
				});

				uploader.on.mockImplementation( async(name, cb) => {
					if (name === mockChunkEvents.CHUNK_START) {
						const result = await cb({
							chunk: {
								start: 1234,
							},
							item: { id: "i1" },
						});

						expect(result.url).toBe("upload.url");
						expect(result.sendOptions.sendWithFormData).toBe(false);
						expect(result.sendOptions.method).toBe("PATCH");

						expect(result.sendOptions.headers["X-HTTP-Method-Override"]).toBeUndefined();
						expect(result.sendOptions.headers["Content-Range"]).toBeUndefined();
						expect(result.sendOptions.headers["Upload-Length"]).toBeUndefined();
						expect(result.sendOptions.headers["Upload-Offset"]).toBe(123);
						expect(result.sendOptions.headers["tus-resumable"]).toBe("1");
						expect(result.sendOptions.headers["Content-Type"]).toBe( "application/offset+octet-stream");
					}
				});

				handleEvents(uploader, tusState, chunkedSender);

				expect(uploader.on).toHaveBeenCalledWith(mockChunkEvents.CHUNK_START, expect.any(Function));
			});

			it("should update send options for chunk using chunk start", () => {
				const tusState = getTusState({
					items: {
						"i1": {
							offset: 0,
							uploadUrl: "upload.url"
						}
					}
				});

				uploader.on.mockImplementation(async (name, cb) => {
					if (name === mockChunkEvents.CHUNK_START) {
						const result = await cb({
							chunk: {
								start: 1234,
							},
							item: { id: "i1" },
						});

						expect(result.url).toBe("upload.url");
						expect(result.sendOptions.sendWithFormData).toBe(false);
						expect(result.sendOptions.method).toBe("PATCH");
						expect(result.sendOptions.headers["Upload-Offset"]).toBe(1234);
					}
				});

				handleEvents(uploader, tusState, chunkedSender);

				expect(uploader.on).toHaveBeenCalledWith(mockChunkEvents.CHUNK_START, expect.any(Function));
			});

			it("should update send options with method override", () => {
				const tusState = getTusState({
					options: {
						overrideMethod: true,
					},
					items: {
						"i1": {
							offset: 1,
							uploadUrl: "upload.url"
						}
					}
				});

				uploader.on.mockImplementation(async (name, cb) => {
					if (name === mockChunkEvents.CHUNK_START) {
						const result = await cb({
							chunk: {
								start: 1234,
							},
							item: { id: "i1" },
						});

						expect(result.url).toBe("upload.url");
						expect(result.sendOptions.sendWithFormData).toBe(false);
						expect(result.sendOptions.method).toBe("POST");
						expect(result.sendOptions.headers["Upload-Offset"]).toBe(1);
					}
				});

				handleEvents(uploader, tusState, chunkedSender);
				expect(uploader.on).toHaveBeenCalledWith(mockChunkEvents.CHUNK_START, expect.any(Function));
			});

			it("should update send options with length deferred", () => {
				const tusState = getTusState({
					items: {
						"i1": {
							offset: 123,
							uploadUrl: "upload.url"
						}
					},
					options: {
						deferLength: true,
					}
				});

				uploader.on.mockImplementation(async (name, cb) => {
					if (name === mockChunkEvents.CHUNK_START) {
						const result = await cb({
							chunk: {
								start: 1234,
								index: 2
							},
							item: { id: "i1", file: { size: 999 } },
							chunkCount: 3,
						});

						expect(result.url).toBe("upload.url");
						expect(result.sendOptions.sendWithFormData).toBe(false);
						expect(result.sendOptions.method).toBe("PATCH");

						expect(result.sendOptions.headers["Upload-Length"]).toBe(999);
					}
				});

				handleEvents(uploader, tusState, chunkedSender);

				expect(uploader.on).toHaveBeenCalledWith(mockChunkEvents.CHUNK_START, expect.any(Function));
			});

			it("parallel - should update send options for parallelized chunk", () => {
				const tusState = getTusState({
					items: {
						"i1": {
							uploadUrl: "upload.url",
							parallelChunks: []
						},
						"ci1": {
							uploadUrl: "chunk.url",
						}
					},
					options: {
						parallel: 2,
					}
				});

				uploader.on.mockImplementation(async (name, cb) => {
					if (name === mockChunkEvents.CHUNK_START) {

						mockInitTus.mockReturnValueOnce({
							request: Promise.resolve({
								state: FILE_STATES.UPLOADING
							})
						});

						const data = {
							chunk: {
								id: "i1"
							},
							chunkItem: {
								id: "ci1"
							},
							item: { id: "i1", file: { size: 999 } },
						};

						const result = await cb(data);

						expect(result.url).toBe("chunk.url");
						expect(result.sendOptions.sendWithFormData).toBe(false);
						expect(result.sendOptions.method).toBe("PATCH");
						expect(result.sendOptions.headers["Upload-Offset"]).toBe(0);
						expect(result.sendOptions.headers["Upload-Length"]).toBe(undefined);
						expect(result.sendOptions.headers["Upload-Concat"]).toBe("partial");

						expect(tusState.getState().items["i1"].parallelChunks[0])
							.toBe(data.chunkItem.id);
					}
				});

				handleEvents(uploader, tusState, chunkedSender);

				expect(uploader.on).toHaveBeenCalledWith(mockChunkEvents.CHUNK_START, expect.any(Function));
			});

			it("parallel - should return false when chunk already finished", () => {

				const tusState = getTusState({
					items: {
						"i1": {
							offset: 0,
							uploadUrl: "upload.url",
							parallelChunks: [],
						}
					},
					options: {
						parallel: 2,
					}
				});

				uploader.on.mockImplementation(async (name, cb) => {
					if (name === mockChunkEvents.CHUNK_START) {
						const data = {
							chunk: {
								start: 1234,
							},
							chunkItem: {
								id: "ci1",
							},
							item: { id: "i1" },
						};

						mockInitTus.mockReturnValueOnce({
							request: Promise.resolve({state: FILE_STATES.FINISHED}),
						});

						const result = await cb(data);

						expect(result).toBe(false);
						expect(tusState.getState().items["i1"].parallelChunks[0])
							.toBe(data.chunkItem.id);
					}
				});

				handleEvents(uploader, tusState, chunkedSender);

				expect(uploader.on).toHaveBeenCalledWith(mockChunkEvents.CHUNK_START, expect.any(Function));
			});
		});
	});
});
