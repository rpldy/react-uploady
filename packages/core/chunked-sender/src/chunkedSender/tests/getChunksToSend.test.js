import ChunkedSendError from "../ChunkedSendError";
import getChunksToSend from "../getChunksToSend";
import getChunkedState from "./mocks/getChunkedState.mock";

describe("getChunkToSend tests", () => {
	it("should return 0 chunks if already in progress and no parallel", () => {
		const chunks = getChunksToSend(getChunkedState({
			requests: { "c1": {} },
			chunks: [1, 2]
		}));

		expect(chunks).toHaveLength(0);
	});

	it("should return 0 chunks if no chunks left", () => {
		const chunks = getChunksToSend(getChunkedState({
			requests: {},
			chunks: [],
		}));

		expect(chunks).toHaveLength(0);
	});

	it("should return 1 chunk to send for no parallel and no in progress", () => {
		const chunks = getChunksToSend(getChunkedState({
			requests: {},
			chunks: [1, 2, 3],
			parallel: 1,
		}));

		expect(chunks).toEqual([1]);
	});

	it("should return chunk that isnt active when parallel > 1", () => {
		const chunks = getChunksToSend(getChunkedState({
			requests: { 1: {} },
			chunks: [{ id: "1" }, { id: "2" }],
			parallel: 2,
		}));

		expect(chunks).toEqual([{ id: "2" }]);
	});

	it("should return multiple chunks to send if parallel > 1", () => {
		const chunks = [{ id: "1" }, { id: "2" }];

		const sendChunks = getChunksToSend(getChunkedState({
			requests: {},
			chunks: [...chunks, { id: "3" }],
			parallel: 2,
		}));

		expect(sendChunks).toEqual(chunks);
	});

    it("should not return more chunks than allowed by parallel value including already in progress", () => {
        const chunks = getChunksToSend(getChunkedState({
            requests: { 1: {} },
            chunks: [{ id: "1" }, { id: "2" }, { id: "3" }],
            parallel: 2,
        }));

        expect(chunks).toEqual([{ id: "2" }]);
    });

    it("should return chunk while its below attempts limit", () => {
		const chunk = { id: "3", attempt: 1 };

		const chunks = getChunksToSend(getChunkedState({
			requests: {},
			retries: 2,
			chunks: [chunk],
		}));

		expect(chunks).toEqual([chunk]);
	});

	it("should throw ChunkedSendError if chunk is over the attempt limit", () => {
		expect(() => {
            getChunksToSend(getChunkedState({
				requests: {},
				retries: 1,
				chunks: [{ id: "3", attempt: 1 }],
			}));
		}).toThrow(ChunkedSendError);
	});
});
