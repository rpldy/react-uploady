import { request } from "@rpldy/shared/src/tests/mocks/rpldy-shared.mock";
import { safeSessionStorage } from "@rpldy/safe-storage/src/tests/mocks/safeStorage.mock";
import createMockState from "./tusState.mock";
import { FD_STORAGE_PREFIX } from "../consts";
import doFeatureDetection from "../featureDetection";

describe("featureDetection tests", () => {

	beforeEach(() => {
		clearJestMocks(
			request,
			safeSessionStorage,
		);
	});

	it("should do nothing when already processed", () => {

		doFeatureDetection("", createMockState({
			featureDetection: {
				processed: true,
			}
		}));

		expect(request).not.toHaveBeenCalled();
	});

	describe("session storage handling", () => {
		it("should handle with options onFeaturesDetected callback from storage", () => {
			const onFeaturesDetected = jest.fn((exts) => {
				expect(exts).toHaveLength(3);
				return {
					deferLength: false,
				};
			});

			const tusState = createMockState({
				options: {
					onFeaturesDetected,
					deferLength: true,
				},
				featureDetection: {
					processed: false,
				}
			});

			safeSessionStorage.getItem.mockReturnValueOnce(JSON.stringify({
				extensions: "creation,creation-with-upload,concatenation",
				version: "1.0.0",
			}));

			const result = doFeatureDetection("upload.url", tusState);

			expect(result).toBe(null);
			expect(request).not.toHaveBeenCalled();
			expect(onFeaturesDetected).toHaveBeenCalled();

			expect(tusState.getState().options.deferLength).toBe(false);
		});

		it("should handle empty response from onFeaturesDetected from storage", () => {
			const onFeaturesDetected = jest.fn((exts) => {
				expect(exts).toHaveLength(3);
			});

			const tusState = createMockState({
				options: {
					onFeaturesDetected,
					deferLength: true,
				},
				featureDetection: {
					processed: false,
				}
			});

			safeSessionStorage.getItem.mockReturnValueOnce(JSON.stringify({
				extensions: "creation,creation-with-upload,concatenation",
				version: "1.0.0",
			}));

			const result = doFeatureDetection("upload.url", tusState);

			expect(result).toBe(null);
			expect(request).not.toHaveBeenCalled();
			expect(onFeaturesDetected).toHaveBeenCalled();

			expect(tusState.getState().options.deferLength).toBe(true);
			expect(tusState.getState().options.onFeaturesDetected).toBeDefined();
		});

		it("should turn off options in case of missing extensions from storage", () => {
			const tusState = createMockState({
				options: {
					deferLength: true,
					parallel: 2,
					sendDataOnCreate: true,
				},
				featureDetection: {
					processed: false,
				}
			});

			safeSessionStorage.getItem.mockReturnValueOnce(JSON.stringify({
				extensions: "creation",
				version: "1.0.0",
			}));

			const result = doFeatureDetection("upload.url", tusState);

			expect(result).toBe(null);

			expect(tusState.getState().options).toEqual(expect.objectContaining({
				deferLength: false,
				parallel: 1,
				sendDataOnCreate: false,
			}));
		});

		it("should leave options as is in case extensions found", () => {
			const tusState = createMockState({
				options: {
					deferLength: true,
					parallel: 2,
					sendDataOnCreate: true,
				},
				featureDetection: {
					processed: false,
				}
			});

			safeSessionStorage.getItem.mockReturnValueOnce(JSON.stringify({
				extensions: "creation,creation-with-upload,termination,concatenation,creation-defer-length",
				version: "1.0.0",
			}));

			const result = doFeatureDetection("upload.url", tusState);

			expect(result).toBe(null);

			expect(tusState.getState().options).toEqual(expect.objectContaining({
				deferLength: true,
				parallel: 2,
				sendDataOnCreate: true,
			}));
		});

		it("should query server on storage parsing error", () => {
			const tusState = createMockState({
				options: {
					deferLength: true,
					parallel: 2,
					sendDataOnCreate: true,
				},
				featureDetection: {
					processed: false,
				}
			});

			safeSessionStorage.getItem.mockReturnValueOnce({});

			request.mockReturnValueOnce(new Promise(() => {
			}));

			const result = doFeatureDetection("upload.url", tusState);

			expect(result.request).toBeInstanceOf(Promise);
			expect(result.abort).toBeInstanceOf(Function);
			expect(safeSessionStorage.removeItem).toHaveBeenCalled();

			expect(request).toHaveBeenCalledWith("upload.url", null, {
				method: "OPTIONS",
				headers: {
					"tus-resumable": tusState.getState().options.version,
				}
			});
		});

		it("should query server if storage doesnt have extensions", () => {

			const tusState = createMockState({
				options: {
					deferLength: true,
					parallel: 2,
					sendDataOnCreate: true,
				},
				featureDetection: {
					processed: false,
				}
			});

			safeSessionStorage.getItem.mockReturnValueOnce(JSON.stringify({}));

			request.mockReturnValueOnce(new Promise(() => {
			}));

			const result = doFeatureDetection("upload.url", tusState);

			expect(result.request).toBeInstanceOf(Promise);
			expect(result.abort).toBeInstanceOf(Function);
			expect(safeSessionStorage.removeItem).toHaveBeenCalled();

			expect(request).toHaveBeenCalledWith("upload.url", null, {
				method: "OPTIONS",
				headers: {
					"tus-resumable": tusState.getState().options.version,
				}
			});

		});
	});

	describe("new session handling", () => {
		const xhrResponse = {
			status: 200,
			getResponseHeader: jest.fn(),
		};

		beforeEach(() => {
			xhrResponse.status = 200;

			clearJestMocks(
				xhrResponse.getResponseHeader
			);
		});

		it("should handle request exception gracefully", async () => {
			const tusState = createMockState();

			request.mockReturnValueOnce(Promise.reject("error"));

			const result = doFeatureDetection("upload.url", tusState);

			const requestResult = await result.request;
			expect(requestResult).toBe(undefined);
		});

		it("should handle server error gracefully", async () => {
			const tusState = createMockState();
			xhrResponse.status = 400;

			request.mockReturnValueOnce(Promise.resolve(xhrResponse));

			const result = doFeatureDetection("upload.url", tusState);

			expect(xhrResponse.getResponseHeader).not.toHaveBeenCalled();
			const requestResult = await result.request;
			expect(requestResult).toBe(undefined);
		});

		it("should abort fd request", () => {
			const tusState = createMockState();

			const pXhr = Promise.resolve(xhrResponse);
			pXhr.xhr = {
				abort: jest.fn()
			};

			request.mockReturnValueOnce(pXhr);

			const result = doFeatureDetection("upload.url", tusState);

			result.abort();
			expect(pXhr.xhr.abort).toHaveBeenCalled();
		});

		it("should use version from server", async () => {
			const tusState = createMockState();

			const pXhr = Promise.resolve(xhrResponse);
			pXhr.xhr = {
				abort: jest.fn()
			};

			xhrResponse.getResponseHeader
				.mockReturnValueOnce()
				.mockReturnValueOnce("1.0.1");

			request.mockReturnValueOnce(pXhr);

			const result = doFeatureDetection("upload.url", tusState);
			await result.request;

			expect(tusState.getState().options.version).toBe("1.0.1");
			expect(safeSessionStorage.setItem).not.toHaveBeenCalled();
		});

		it("should turn off options in case of missing extensions from server", async () => {
			const tusState = createMockState({
				options: {
					deferLength: true,
					parallel: 2,
					sendDataOnCreate: true,
				},
				featureDetection: {
					processed: false,
				}
			});

			const pXhr = Promise.resolve(xhrResponse);
			pXhr.xhr = {
				abort: jest.fn()
			};

			xhrResponse.getResponseHeader
				.mockReturnValueOnce("creation");

			request.mockReturnValueOnce(pXhr);

			const result = doFeatureDetection("upload.url", tusState);

			await result.request;

			expect(tusState.getState().options).toEqual(expect.objectContaining({
				deferLength: false,
				parallel: 1,
				sendDataOnCreate: false,
			}));

			expect(safeSessionStorage.setItem)
				.toHaveBeenCalledWith(`${FD_STORAGE_PREFIX}upload.url`, JSON.stringify({
					version: undefined,
					extensions: "creation"
				}));
		});
	});
});
