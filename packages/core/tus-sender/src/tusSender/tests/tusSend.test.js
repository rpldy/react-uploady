import { TUS_SENDER_TYPE } from "../../consts";
import createMockState from "../../tests/tusState.mock";

describe("tusSend tests", () => {
	let getTusSend, xhrSend;

	const chunkedSender = { send: jest.fn() };

	describe("no chunk support", () => {
		beforeAll(() => {
			jest.resetModules();
			jest.mock("@rpldy/chunked-sender", () => ({
				CHUNKING_SUPPORT: false,
			}));

			jest.mock("@rpldy/sender", () => jest.fn());

			getTusSend = require("../tusSend").default;
			xhrSend = require("@rpldy/sender");
		});

		it("should use xhrSender for no chunk support", () => {
			const send = getTusSend(chunkedSender, null);
			expect(send).toBe(xhrSend);
		});
	});

	describe("with chunk support", () => {
		let initTusUpload, doFeatureDetection;

		beforeAll(() => {
			jest.resetModules();
			jest.mock("@rpldy/chunked-sender", () => ({
				CHUNKING_SUPPORT: true,
			}));

			jest.mock("@rpldy/sender", () => jest.fn());
			jest.mock("../initTusUpload", () => jest.fn());
			jest.mock("../../featureDetection", () => jest.fn());

			getTusSend = require("../tusSend").default;
			initTusUpload = require("../initTusUpload");
			doFeatureDetection = require("../../featureDetection");
		});

		beforeEach(() => {
			clearJestMocks(
				initTusUpload,
				doFeatureDetection,
			);
		});

		it("should send with chunkedSender for multiple items", () => {
			const send = getTusSend(chunkedSender, createMockState());

			send([1, 2, 3], "upload.url", "sendOptions", "onProgress");
			expect(chunkedSender.send).toHaveBeenCalledWith([1, 2, 3], "upload.url", "sendOptions", "onProgress");
			expect(doFeatureDetection).not.toHaveBeenCalled();
		});

		it("should send with chunkedSender for url item", () => {
			const send = getTusSend(chunkedSender, createMockState());
			const items = [{ url: "file.com" }];

			send(items, "upload.url", "sendOptions", "onProgress");
			expect(chunkedSender.send).toHaveBeenCalledWith(items, "upload.url", "sendOptions", "onProgress");
		});

		it("should send with tus sender", () => {
			const send = getTusSend(chunkedSender, createMockState());
			const abort = jest.fn(() => true);

			initTusUpload.mockReturnValueOnce({
				request: "request",
				abort,
			});

			const result = send([{ file: {} }], "upload.url", "sendOptions", "onProgress");

			expect(result.senderType).toBe(TUS_SENDER_TYPE);
			expect(result.request).toBe("request");
			expect(result.abort()).toBe(true);
			expect(abort).toHaveBeenCalled();
		});

		it("should wait for feature detection ", async () => {
			const abort = jest.fn(() => true);

			doFeatureDetection.mockReturnValueOnce({
				request: Promise.resolve(),
			});

			initTusUpload.mockReturnValueOnce({
				request: "request",
				abort,
			});

			const send = getTusSend(chunkedSender, createMockState({
				options: {
					featureDetection: true
				}
			}));

			const result = send([{ file: {} }], "upload.url", "sendOptions", "onProgress");

			await result.request;

			expect(result.abort()).toBe(true);
			expect(abort).toHaveBeenCalled();
		});

		it("should be able to abort feature detection",  () => {
			const abort = jest.fn(() => true);

			doFeatureDetection.mockReturnValueOnce({
				request: Promise.resolve(),
				abort,
			});

			initTusUpload.mockReturnValueOnce({
				request: "request",
			});

			const send = getTusSend(chunkedSender, createMockState({
				options: {
					featureDetection: true
				}
			}));

			const result = send([{ file: {} }], "upload.url", "sendOptions", "onProgress");

			expect(result.abort()).toBe(true);
			expect(abort).toHaveBeenCalled();
		});
	});
});