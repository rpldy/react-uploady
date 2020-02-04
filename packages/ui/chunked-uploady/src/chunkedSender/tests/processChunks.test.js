import getChunks from "../getChunks";
import sendChunks from "../sendChunks";
import processChunks, { process, abortChunkedRequest } from "../processChunks";

jest.mock("../getChunks", () => jest.fn());
jest.mock("../sendChunks", () => jest.fn());

describe("processChunks tests", () => {

	beforeEach(() => {
		clearJestMocks(
			getChunks,
			sendChunks,
		);
	});

	it("should create state and process chunks", () => {

		const item = {file: {name: "file"}},
			chunkedOptions = { parallel: true },
			url = "test.com",
			sendOptions = {},
			chunks = [1,2,3],
			onProgress = jest.fn();

		getChunks.mockReturnValueOnce(chunks);

		const result = processChunks(item, chunkedOptions, url, sendOptions, onProgress);

		expect(result.abort).toBeInstanceOf(Function);
		expect(result.request).toBeInstanceOf(Promise);

		expect(sendChunks).toHaveBeenCalledWith({
			finished: false,
			aborted: false,
			requests: {},
			responses: [],
			chunks,
			url,
			sendOptions,
			...chunkedOptions,
		}, item, expect.any(Function), expect.any(Function));
	});

	describe("process tests", () => {

		it("should send chunks and handle progress", () => {
			const state = {
				chunks: [
					{ id: "c1", progress: 0 },
					{ id: "c2", progress: 30 },
					{ id: "c3", progress: 20 },
				]
			};
			const item = { file: { size: 1000 } };
			const onProgress = jest.fn();

			process(state, item, onProgress);

			expect(sendChunks).toHaveBeenCalledWith(state, item, expect.any(Function), expect.any(Function));

			sendChunks.mock.calls[0][2]({ loaded: 200 }, [{ id: "c1" }, { id: "c2" }]);

			expect(onProgress).toHaveBeenCalledWith({
				loaded: 250,
				total: 1000
			}, [item]);

			sendChunks.mock.calls[0][2]({ loaded: 100 }, [{ id: "c3" }]);

			expect(onProgress).toHaveBeenCalledWith({
				loaded: 350,
				total: 1000
			}, [item]);
		});

		it("should send single chunk and handle progress", () => {
			const state = {
				chunks: [
					{ id: "c1", progress: 0 },
				]
			};

			const item = { file: { size: 1000 } };
			const onProgress = jest.fn();

			process(state, item, onProgress);

			expect(sendChunks).toHaveBeenCalledWith(state, item, expect.any(Function), expect.any(Function));

			sendChunks.mock.calls[0][2]({ loaded: 200 }, [{ id: "c1" }]);

			expect(onProgress).toHaveBeenCalledWith({
				loaded: 200,
				total: 1000
			}, [item]);
		});
	});

	describe("abortChunkedRequest", () => {

		it("should do nothing for finished request ", () => {
			const abort = jest.fn();

			const state = {
				finished: true,
				requests: {
					c1: { abort, }
				}
			};

			abortChunkedRequest(state, {});

			expect(abort).not.toHaveBeenCalled();
			expect(state.aborted).toBeFalsy();
		});

		it("should do nothing for aborted request ", () => {
			const abort = jest.fn();

			const state = {
				finished: true,
				requests: {
					c1: { abort, }
				}
			};

			abortChunkedRequest(state, {});

			expect(abort).not.toHaveBeenCalled();
		});

		it("should abort requests for in progress request", () => {

			const abort = jest.fn();

			const state = {
				requests: {
					c1: { abort, },
					c2: { abort, },
					c3: { abort, },
				}
			};

			abortChunkedRequest(state, {});

			expect(abort).toHaveBeenCalledTimes(3);

			expect(state.aborted).toBe(true);
		});
	});

});