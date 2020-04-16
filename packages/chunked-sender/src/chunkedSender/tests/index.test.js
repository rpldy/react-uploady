import send from "@rpldy/sender";
import processChunks from "../processChunks";
import getChunkedSend from "../";

jest.mock("@rpldy/sender", () => jest.fn());

jest.mock("../../utils", () => ({
	getMandatoryOptions: jest.fn((options) => options),
}));

jest.mock("../processChunks", () => jest.fn());

describe("chunkedSender index tests", () => {
	const url = "test.com",
		sendOptions = {},
		onProgress = {};

	const doChunkedSend = (items, chunkedOptions = {}) => {
		const send = getChunkedSend(chunkedOptions);
		return send(items, url, sendOptions, onProgress);
	};

	beforeEach(() => {
		clearJestMocks(send, processChunks);
	});

	it("should use default send for chunked = false", () => {
		const items = [];

		send.mockReturnValueOnce(true);
		const result = doChunkedSend(items);
		expect(result).toBe(true);

		expect(send).toHaveBeenCalledWith(items, url, sendOptions, onProgress);
		expect(processChunks).not.toHaveBeenCalled();
	});

	it("should use default send for multiple items", () => {
		const items = [1, 2];
		doChunkedSend(items, {});
		expect(send).toHaveBeenCalledWith(items, url, sendOptions, onProgress);
		expect(processChunks).not.toHaveBeenCalled();
	});

	it("should use default send for url item", () => {
		const items = [{ url: "file" }];
		doChunkedSend(items, {});
		expect(send).toHaveBeenCalledWith(items, url, sendOptions, onProgress);
		expect(processChunks).not.toHaveBeenCalled();
	});

	it("should use default send for chunk size > file size", () => {
		const items = [{ file: { size: 1000 } }];
		doChunkedSend(items, { chunkSize: 1001 });
		doChunkedSend(items, { chunkSize: 1000 });
		expect(send).toHaveBeenCalledWith(items, url, sendOptions, onProgress);
		expect(processChunks).not.toHaveBeenCalled();
	});

	it("should use chunked send", () => {
		const items = [{ file: { size: 1e+6 } }];
		const chunkedOptions = { chunked: true, chunkSize: 5e+5 };

		processChunks.mockReturnValueOnce(true);

		const result = doChunkedSend(items, chunkedOptions);
		expect(result).toBe(true);
		expect(send).not.toHaveBeenCalled();
		expect(processChunks).toHaveBeenCalledWith(items[0], chunkedOptions, url, sendOptions, onProgress);
	});
});