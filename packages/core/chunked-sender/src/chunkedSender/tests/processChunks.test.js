import getChunks from "../getChunks";
import sendChunks from "../sendChunks";
import processChunks, { process, abortChunkedRequest } from "../processChunks";

jest.mock("lodash", () => ({ throttle: (fn) => fn })); //doesnt work :(
jest.mock("../getChunks", () => jest.fn());
jest.mock("../sendChunks", () => jest.fn());

describe("processChunks tests", () => {

	beforeEach(() => {
	    jest.useRealTimers();

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
			onProgress = jest.fn(),
            trigger = jest.fn();

		getChunks.mockReturnValueOnce(chunks);

		const result = processChunks(item, chunkedOptions, url, sendOptions, onProgress, trigger);

		expect(result.abort).toBeInstanceOf(Function);
		expect(result.request).toBeInstanceOf(Promise);

		expect(sendChunks).toHaveBeenCalledWith({
			finished: false,
			aborted: false,
            error: false,
			uploaded: {},
			requests: {},
			responses: [],
            chunkCount: chunks.length,
			chunks,
			url,
			sendOptions,
			...chunkedOptions,
		}, item, expect.any(Function), expect.any(Function), expect.any(Function));
	});

	describe("process tests", () => {
		it("should send chunks and handle progress", () => {
		    jest.useFakeTimers(); //using fake timers coz for some reason lodash isnt mocked... :(

			const state = {
				uploaded: {},
				chunks: [
                    {
                        start: 4,
                    }
				]
			};

			const item = { file: { size: 1000 }};
			const onProgress = jest.fn();
			const trigger = jest.fn();

			process(state, item, onProgress, trigger);

			expect(sendChunks).toHaveBeenCalledWith(state, item, expect.any(Function), expect.any(Function), expect.any(Function));

			const onChunkProgress = sendChunks.mock.calls[0][2];

			onChunkProgress({ loaded: 200 }, [{id: "c1"}]);

			expect(onProgress).toHaveBeenCalledWith({
				loaded: 204,
				total: 1000
			}, [item]);

			jest.runAllTimers();
            onChunkProgress({ loaded: 300 }, [{id: "c1"}]);

			expect(onProgress).toHaveBeenCalledWith({
				loaded: 304,
				total: 1000
			}, [item]);

            jest.runAllTimers();
            onChunkProgress({ loaded: 300 }, [{id: "c2"}]);

            expect(onProgress).toHaveBeenCalledWith({
                loaded: 604,
                total: 1000
            }, [item]);

            expect(onProgress).toHaveBeenCalledTimes(3);
		});

		it("should call abort on chunks", () => {
			const abort = jest.fn();

			const state = {
				requests: {
					c1: { abort, },
					c2: { abort, },
				},
			};

			const result = process(state, {}, );

			result.abort();

			expect(abort).toHaveBeenCalledTimes(2);

			expect(state.aborted).toBe(true);
		});
	});

	describe("abortChunkedRequest", () => {

		it("should do nothing for finished request", () => {
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

		it("should do nothing for aborted request", () => {
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
