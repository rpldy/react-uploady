import send from "@rpldy/sender";
import processChunks from "../processChunks";
import createChunkedSender from "../createChunkedSender";

vi.mock("@rpldy/sender");

vi.mock("../../utils", () => ({
	getMandatoryOptions: vi.fn((options) => options),
}));

vi.mock("../processChunks");

describe("chunkedSender index tests", () => {
	const url = "test.com",
		sendOptions = {},
		onProgress = {},
		trigger = "trigger";

	const doChunkedSend = (items, chunkedOptions = {}) => {
		const { send } = createChunkedSender(chunkedOptions,trigger);
		return send(items, url, sendOptions, onProgress);
	};

	beforeEach(() => {
		clearViMocks(send, processChunks);
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

    it("should use default send for 0 size file", () => {
        const items = [{ file: { size: 0 } }];
        doChunkedSend(items, {});
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
		expect(processChunks).toHaveBeenCalledWith(items[0], chunkedOptions, url, sendOptions, onProgress, "trigger");
	});
});
