import { TUS_SENDER_TYPE } from "../consts";

describe("tusSend tests", () => {
	let getTusSend, xhrSend;

	const tusState = {},
		chunkedSender = { send: jest.fn() };

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
			const send = getTusSend(chunkedSender, tusState);
			expect(send).toBe(xhrSend);
		});
	});

	describe("with chunk support", () => {
		let initTusUpload;

		beforeAll(() => {
			jest.resetModules();
			jest.mock("@rpldy/chunked-sender", () => ({
				CHUNKING_SUPPORT: true,
			}));

			jest.mock("@rpldy/sender", () => jest.fn());
			jest.mock("../initTusUpload", () => jest.fn());

			getTusSend = require("../tusSend").default;
			initTusUpload = require("../initTusUpload");
		});

		it("should send with chunkedSender for multiple items", () => {
			const send = getTusSend(chunkedSender, tusState);

			send([1, 2, 3], "upload.url", "sendOptions", "onProgress");
			expect(chunkedSender.send).toHaveBeenCalledWith([1, 2, 3], "upload.url", "sendOptions", "onProgress");
		});

		it("should send with chunkedSender for url item", () => {
			const send = getTusSend(chunkedSender, tusState);
			const items = [{ url: "file.com" }];

			send(items, "upload.url", "sendOptions", "onProgress");
			expect(chunkedSender.send).toHaveBeenCalledWith(items, "upload.url", "sendOptions", "onProgress");
		});

		it("should send with tus sender", () => {
			const send = getTusSend(chunkedSender, tusState);
			const items = [{ file: {}}];

			initTusUpload.mockReturnValueOnce({
				request: "request"
			});

			const result = send(items, "upload.url", "sendOptions", "onProgress");

			expect(result.senderType).toBe(TUS_SENDER_TYPE);
			expect(result.request).toBe("request");
		});
	});
});