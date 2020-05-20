import { UPLOADER_EVENTS } from "@rpldy/uploader";
import { CHUNK_EVENTS as mockChunkEvents } from "@rpldy/chunked-sender";
import getTusState from "./tusState.mock";

describe("handleEvents tests ", () => {
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
		beforeAll(() => {
			jest.resetModules();
			jest.mock("@rpldy/chunked-sender", () => ({
				CHUNK_EVENTS: mockChunkEvents,
				CHUNKING_SUPPORT: true,
			}));

			handleEvents = require("../handleEvents").default;
		});

		describe("uploader ITEM_FINALIZE tests", () => {
			it("should clean up after ITEM_FINALIZE", () => {
				const tusState = getTusState({
					items: {
						"i1": {
							offset: 0,
						}
					}
				});

				uploader.on.mockImplementationOnce((name, cb) => {
					cb({ id: "i1" });
					expect(tusState.getState().items.i1).toBeUndefined();
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
		});

		describe("chunkedSender CHUNK_FINISH tests", () => {
			it.each([
				false,
				true
			])("should handle CHUNK_FINISH event for success = %s chunk upload", (success) => {
				const tusState = getTusState({
					items: {
						"i1": {
							offset: 0,
						}
					}
				});

				chunkedSender.on.mockImplementation((name, cb) => {
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

				expect(chunkedSender.on).toHaveBeenCalledWith(mockChunkEvents.CHUNK_FINISH, expect.any(Function));
			});

			it("should handle CHUNK_FINISH and do nothing if item not found", () => {
				const tusState = getTusState({ items: {} });

				chunkedSender.on.mockImplementation((name, cb) => {
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

				expect(chunkedSender.on).toHaveBeenCalled();
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

				chunkedSender.on.mockImplementation((name, cb) => {
					if (name === mockChunkEvents.CHUNK_START) {
						const result = cb({
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

				expect(chunkedSender.on).toHaveBeenCalledWith(mockChunkEvents.CHUNK_START, expect.any(Function));
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

				chunkedSender.on.mockImplementation((name, cb) => {
					if (name === mockChunkEvents.CHUNK_START) {
						const result = cb({
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

				expect(chunkedSender.on).toHaveBeenCalledWith(mockChunkEvents.CHUNK_START, expect.any(Function));
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

				chunkedSender.on.mockImplementation((name, cb) => {
					if (name === mockChunkEvents.CHUNK_START) {
						const result = cb({
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
				expect(chunkedSender.on).toHaveBeenCalledWith(mockChunkEvents.CHUNK_START, expect.any(Function));
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

				chunkedSender.on.mockImplementation((name, cb) => {
					if (name === mockChunkEvents.CHUNK_START) {
						const result = cb({
							chunk: {
								start: 1234,
							},
							item: { id: "i1", file: { size: 999 } },
							chunkIndex: 2,
							chunkCount: 3,
						});

						expect(result.url).toBe("upload.url");
						expect(result.sendOptions.sendWithFormData).toBe(false);
						expect(result.sendOptions.method).toBe("PATCH");

						expect(result.sendOptions.headers["Upload-Length"]).toBe(999);
					}
				});

				handleEvents(uploader, tusState, chunkedSender);

				expect(chunkedSender.on).toHaveBeenCalledWith(mockChunkEvents.CHUNK_START, expect.any(Function));
			});
		});
	});
});