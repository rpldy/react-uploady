import { request } from "@rpldy/shared/src/tests/mocks/rpldy-shared.mock";
import { getChunkDataFromFile } from "@rpldy/chunked-sender";
import createMockState from "../../tests/tusState.mock";
import createUpload, { resolveUploadUrl, getUploadMetadata } from "../createUpload";

jest.mock("@rpldy/chunked-sender", () => ({
	getChunkDataFromFile: jest.fn(),
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
			"/upload/123",
			"upload/123"
		])("should combine location with create url without trailing /", (loc) => {
			expect(resolveUploadUrl("https://www.test.com/tus", loc))
				.toEqual("https://www.test.com/tus/upload/123");
		});

		it.each([
			"/upload/123",
			"upload/123"
		])("should combine location with create url with trailing /", (loc) => {
			expect(resolveUploadUrl("https://www.test.com/tus/", loc))
				.toEqual("https://www.test.com/tus/upload/123");
		});
	});

	describe("getUploadMetadata tests", () => {
		it("should return undefined if no params", () => {
			expect(getUploadMetadata({})).toBeUndefined();
		});

		it("should return undefined if empty params", () => {
			expect(getUploadMetadata({ params: {} })).toBeUndefined();
		});

		it("should return encoded string for params", () => {
			const options = { params: { test: "a", foo: "bar", "empty": "" } };
			expect(getUploadMetadata(options)).toBe("test YQ==,foo YmFy,empty ");
		});
	});

	describe("createUpload tests", () => {

		beforeEach(() => {
			clearJestMocks(
				request
			);
		});

		const doCreateTest = async (config = {}) => {

			config = {
				status: 200,
				error: false,
				deferLength: false,
				resolveRequest: true,
				sendDataOnCreate: false,
				chunkSize: 200,
				fileSize: 123,
				...config
			};

			const xhrResponse = {
				status: config.status,
				getResponseHeader: jest.fn(),
			};

			const xhr = {
				abort: jest.fn(),
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
				},
				items: {}
			});
			const item = { id: "bi1", file: { size: config.fileSize } };

			const createResult = createUpload(item, url, state, {
				params: config.metadata
			});

			const location = "/test";

			xhrResponse
				.getResponseHeader
				.mockImplementation((name) => {
					return name === "Upload-Offset" ? 1234 : location;
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
				location,
				state,
				item,
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
					"Content-Type": undefined
				}
			});

			expect(state.getState().items[item.id].uploadUrl).toBe(url + location);

			expect(requestResult).toEqual({
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
					"Content-Type": undefined
				}
			});

			expect(requestResult).toEqual({
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
				}
			});

			expect(requestResult).toEqual({
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
				}
			});

			expect(getChunkDataFromFile).toHaveBeenCalledWith(item.file, 0, 50);

			expect(requestResult).toEqual({
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
					"Content-Type": undefined
				}
			});
		});
	});
});
