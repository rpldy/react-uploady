import { request } from "@rpldy/shared/src/tests/mocks/rpldy-shared.mock";
import { getChunkDataFromFile } from "@rpldy/chunked-sender";
import createMockState from "../../../tests/tusState.mock";
import createUpload, { resolveUploadUrl } from "../createUpload";

vi.mock("@rpldy/chunked-sender", () => ({
	getChunkDataFromFile: vi.fn(),
}));

describe("createUpload tests", () => {
	describe("resolveUploadUrl tests", () => {
		it.each([
			"//", "http://", "https://"
		])("should return full URL as is", (prefix) => {
			const loc = `${prefix}www.test.com/upload/123`;
			expect(resolveUploadUrl("", loc))
				.toEqual(loc);
		});

        it.each([
            ["https://www.test.com/tus", "/upload/123"],
            ["https://www.test.com/tus/", "/upload/123"],
        ])("should combine createUrl %s with absolute location %s", (url, loc) => {
            expect(resolveUploadUrl(url, loc))
            		.toEqual("https://www.test.com/upload/123");
        });

        it.each([
            ["https://www.test.com", "upload/123", "https://www.test.com/upload/123"],
            ["https://www.test.com/tus", "upload/123", "https://www.test.com/tus/upload/123"],
            ["https://www.test.com/tus/", "upload/123", "https://www.test.com/tus/upload/123"],
        ])("should combine createUrl %s with relative location %s", (url, loc, expected) => {
            expect(resolveUploadUrl(url, loc))
                .toEqual(expected);
        });

        it.each([
            ["/upload", "/files", "/files"],
            ["/upload", "files", "/upload/files"],
        ])("should combine location: %s with non-origin createUrl: %s", (url, loc, expected) => {
            expect(resolveUploadUrl(url, loc))
                .toEqual(expected);
        });
    });

	describe("createUpload tests", () => {
		beforeEach(() => {
			clearViMocks(
				request
			);
		});

		const doCreateTest = async (config = {}, parallelId = null) => {

			config = {
				status: 200,
				error: false,
				deferLength: false,
				resolveRequest: true,
				sendDataOnCreate: false,
				chunkSize: 200,
				fileSize: 123,
				noResOffset: false,
				parallel: false,
				...config
			};

			const xhrResponse = {
				status: config.status,
				getResponseHeader: vi.fn(),
			};

			const xhr = {
				abort: vi.fn(),
			};

			if (config.error) {
				request.mockRejectedValueOnce("error");
			} else {
				const p = config.resolveRequest ?
					Promise.resolve(xhrResponse) :
					new Promise(() => {
					});

				p.xhr = xhr;

				request.mockReturnValueOnce(p);
			}

			const url = "http://upload";
			const state = createMockState({
				options: {
					deferLength: config.deferLength,
					sendDataOnCreate: config.sendDataOnCreate,
					chunkSize: config.chunkSize,
					parallel: config.parallel
				},
				items: {
					"bi1": {}
				}
			});
			const item = { id: "bi1", file: { size: config.fileSize } };

			const createResult = createUpload(item, url, state, {
				params: config.metadata,
				headers: {
					"x-test": "abcd"
				},
			}, parallelId);

			const location = "/test";

			xhrResponse
				.getResponseHeader
				.mockImplementation((name) => {
					return name === "Upload-Offset" ? (config.noResOffset ? "bla" : 1234) : location;
				});

			const requestResult = config.resolveRequest ?
				await createResult.request :
				createResult.request;

			return {
				state,
				item,
				url,
				requestResult,
				location,
				xhrResponse,
				createResult,
				xhr,
			};
		};

		it("should handle successful create", async () => {
			const {
				requestResult,
				state,
				url,
				createResult,
				xhr,
			} = await doCreateTest();

			expect(request).toHaveBeenCalledWith(url, null, {
				method: "POST", headers: {
					"tus-resumable": state.getState().options.version,
					"Upload-Defer-Length": undefined,
					"Upload-Length": 123,
					"Upload-Metadata": undefined,
					"Content-Type": undefined,
					"x-test": "abcd",
				}
			});

			expect(requestResult).toEqual({
				isDone: false,
				offset: 0,
				uploadUrl: "http://upload/test",
				isNew: true,
			});

			createResult.abort();
			expect(xhr.abort).not.toHaveBeenCalled();
		});

		it("should return null on http error code", async () => {
			const {
				requestResult
			} = await doCreateTest({ status: 400 });

			expect(requestResult).toEqual(null);
		});

		it("should return null on error", async () => {
			const {
				requestResult
			} = await doCreateTest({ error: true });

			expect(requestResult).toEqual(null);
		});

		it("should do create with defer length", async () => {
			const {
				state,
				url,
				requestResult
			} = await doCreateTest({ deferLength: true });

			expect(request).toHaveBeenCalledWith(url, null, {
				method: "POST", headers: {
					"tus-resumable": state.getState().options.version,
					"Upload-Defer-Length": 1,
					"Upload-Length": undefined,
					"Upload-Metadata": undefined,
					"Content-Type": undefined,
					"x-test": "abcd",
				}
			});

			expect(requestResult).toEqual({
				isDone: false,
				offset: 0,
				uploadUrl: "http://upload/test",
				isNew: true,
			});
		});

		it("should do create with data for sendDataOnCreate - entire file", async() => {

			const {
				requestResult,
				item,
				url,
				state,
			} = await doCreateTest({ sendDataOnCreate: true, chunkSize: 123 });

			expect(request).toHaveBeenCalledWith(url, item.file, {
				method: "POST", headers: {
					"tus-resumable": state.getState().options.version,
					"Upload-Defer-Length": undefined,
					"Upload-Length": 123,
					"Upload-Metadata": undefined,
					"Content-Type": "application/offset+octet-stream",
					"x-test": "abcd",
				}
			});

			expect(requestResult).toEqual({
				isDone: false,
				offset: 1234,
				uploadUrl: "http://upload/test",
				isNew: true,
			});
		});

		it("should do create with data for sendDataOnCreate - first chunk", async () => {

			getChunkDataFromFile.mockReturnValueOnce("chunk");

			const {
				requestResult,
				url,
				state,
				item,
			} = await doCreateTest({ sendDataOnCreate: true, chunkSize: 50 });

			expect(request).toHaveBeenCalledWith(url, "chunk", {
				method: "POST", headers: {
					"tus-resumable": state.getState().options.version,
					"Upload-Defer-Length": undefined,
					"Upload-Length": 123,
					"Upload-Metadata": undefined,
					"Content-Type": "application/offset+octet-stream",
					"x-test": "abcd",
				}
			});

			expect(getChunkDataFromFile).toHaveBeenCalledWith(item.file, 0, 50);

			expect(requestResult).toEqual({
				isDone: false,
				offset: 1234,
				uploadUrl: "http://upload/test",
				isNew: true,
			});
		});

		it("should abort xhr before its resolved", async () => {

			const {
				createResult,
				xhr,
			} = await doCreateTest({ resolveRequest: false });

			createResult.abort();
			expect(xhr.abort).toHaveBeenCalled();
		});

		it("should send create with metadata", async () => {
			const {
				url,
				state,
			} = await doCreateTest({metadata: {test: 123}});

			expect(request).toHaveBeenCalledWith(url, null, {
				method: "POST", headers: {
					"tus-resumable": state.getState().options.version,
					"Upload-Defer-Length": undefined,
					"Upload-Length": 123,
					"Upload-Metadata": "test MTIz",
					"Content-Type": undefined,
					"x-test": "abcd",
				}
			});
		});

		it("should not send metadata for parallel chunk", async() => {

			const {
				url,
				state,
			} = await doCreateTest({metadata: {test: 123}}, "pId1");

			expect(request).toHaveBeenCalledWith(url, null, {
				method: "POST", headers: {
					"tus-resumable": state.getState().options.version,
					"Upload-Defer-Length": undefined,
					"Upload-Length": 123,
					"Upload-Metadata": undefined,
					"Content-Type": undefined,
					"x-test": "abcd",
				}
			});
		});

		it("should handle invalid offset response header", async () => {

			const {
				requestResult
			} = await doCreateTest({sendDataOnCreate: true, noResOffset: true});

			expect(requestResult).toEqual({
				isDone: false,
				offset: 0,
				uploadUrl: "http://upload/test",
				isNew: true,
			});
		});

		it("should mark as done for parallel with sendDataOnCreate", async () => {
			const {
				url,
				state,
				requestResult
			} = await doCreateTest({
				parallel: 2,
				chunkSize: 1234,
				sendDataOnCreate: true,
				fileSize: 1234,
				metadata: {test: 123}}, "pId1");

			expect(request).toHaveBeenCalledWith(url, {"size": 1234}, {
				method: "POST", headers: {
					"tus-resumable": state.getState().options.version,
					"Upload-Defer-Length": undefined,
					"Upload-Length": 1234,
					"Upload-Metadata": undefined,
					"Content-Type": "application/offset+octet-stream",
					"x-test": "abcd",
				}
			});

			expect(requestResult).toEqual({
				isDone: true,
				offset: 1234,
				uploadUrl: "http://upload/test",
				isNew: true,
			});
		});
	});
});
