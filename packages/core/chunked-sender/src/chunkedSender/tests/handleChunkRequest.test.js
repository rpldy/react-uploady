import { FILE_STATES } from "@rpldy/shared";
import handleChunkRequest from "../handleChunkRequest";
import { CHUNK_EVENTS } from "../../consts";
import getChunkedState from "./mocks/getChunkedState.mock";

describe("handleChunkRequest tests", () => {

	beforeAll(() => {
		vi.useFakeTimers();
	});

	const doTest = async (chunks, response, trigger) => {
	    const onProgress = vi.fn();
        chunks = chunks ? chunks : [{ id: "c1", start: 1, end: 2, attempt: 0 }, { id: "c2" }];

	    const item = {
            id: "i1",
            file: { size: 2000 }
        };

		const state = getChunkedState({
			requests: {
				"c1": {},
				"c2": {}
			},
			chunks: chunks.slice(),
			responses: []
		});

		const sendResult = {
			request: new Promise((resolve) => {
				setTimeout(() => {
					resolve(response);
				});
			}),
			abort: () => {
			}
		};

		const test = handleChunkRequest(state, item, "c1", sendResult, trigger, onProgress);

		expect(state.getState().requests.c1.id).toBe("c1");
		expect(state.getState().requests.c1.abort).toBeInstanceOf(Function);

		vi.runAllTimers();

		await test;

		return { state: state.getState(), item, onProgress, chunks };
	};

    it("should handle send success", async () => {
        const trigger = vi.fn();
        const response = {
            state: FILE_STATES.FINISHED,
            response: "success"
        };

        const { state, item, onProgress, chunks } = await doTest(null, response, trigger);

        const finishedChunk = chunks[0];

        expect(state.requests.c1).toBeUndefined();
        expect(state.chunks).toHaveLength(1);
        expect(state.chunks[0].id).toBe("c2");
        expect(state.responses[0]).toBe("success");

        expect(trigger).toHaveBeenCalledWith(CHUNK_EVENTS.CHUNK_FINISH, {
            chunk: { id: "c1", start: 1, end: 2, attempt: 0 },
            item,
            uploadData: response,
        });

        expect(onProgress).toHaveBeenCalledWith({ loaded: 1, total: item.file.size }, [finishedChunk]);
    });

	it("should handle send fail", async () => {
        const trigger = vi.fn();

		const { state, onProgress } = await doTest(null, {
			state: FILE_STATES.ERROR,
			response: "fail"
		}, trigger);

		expect(state.requests.c1).toBeUndefined();
		expect(state.chunks).toHaveLength(2);
		expect(state.chunks[0].id).toBe("c1");
		expect(state.chunks[0].attempt).toBe(1);
		expect(state.responses[0]).toBe("fail");

        expect(trigger).not.toHaveBeenCalled();
        expect(onProgress).not.toHaveBeenCalled();
	});

	it("should handle abort", async () => {
		const { state } = await doTest(null, {
			state: FILE_STATES.ABORTED,
			response: "abort"
		});

		expect(state.requests.c1).toBeUndefined();
		expect(state.chunks).toHaveLength(2);
		expect(state.chunks[0].id).toBe("c1");
		expect(state.chunks[0].attempt).toBe(0);
		expect(state.responses[0]).toBe("abort");
	});

	it("should not break if finished chunk not found in state", async () => {

		const { state } = await doTest([]);
		expect(state.requests.c1).toBeUndefined();
	});
});
