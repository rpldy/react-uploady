import { FILE_STATES } from "@rpldy/shared";
import handleChunkRequest from "../handleChunkRequest";
import { CHUNK_EVENTS } from "../../consts";

describe("handleChunkRequest tests", () => {

	beforeAll(() => {
		jest.useFakeTimers();
	});

	const doTest = async (chunks, response, trigger) => {
		const state = {
			requests: {
				"c1": {},
				"c2": {}
			},
			chunks: chunks ? chunks : [{ id: "c1", start: 1, end: 2, attempt: 0 }, { id: "c2" }],
			responses: []
		};

		const sendResult = {
			request: new Promise((resolve) => {
				setTimeout(() => {
					resolve(response);
				});
			}),
			abort: () => {
			}
		};

		const test = handleChunkRequest(state, "c1", sendResult, trigger);

		expect(state.requests.c1.id).toBe("c1");
		expect(state.requests.c1.abort).toBeInstanceOf(Function);

		jest.runAllTimers();

		await test;

		return state;
	};

	it("should handle send success ", async () => {

	    const trigger = jest.fn();

		const state = await doTest(null, {
			state: FILE_STATES.FINISHED,
			response: "success"
		}, trigger);

		expect(state.requests.c1).toBeUndefined();
		expect(state.chunks).toHaveLength(1);
		expect(state.chunks[0].id).toBe("c2");
		expect(state.responses[0]).toBe("success");
        expect(trigger).toHaveBeenCalledWith(CHUNK_EVENTS.CHUNK_FINISH, { id: "c1", start: 1, end: 2});
	});

	it("should handle send fail", async () => {
        const trigger = jest.fn();

		const state = await doTest(null, {
			state: FILE_STATES.ERROR,
			response: "fail"
		}, trigger);

		expect(state.requests.c1).toBeUndefined();
		expect(state.chunks).toHaveLength(2);
		expect(state.chunks[0].id).toBe("c1");
		expect(state.chunks[0].attempt).toBe(1);
		expect(state.responses[0]).toBe("fail");

        expect(trigger).not.toHaveBeenCalled();
	});

	it("should handle abort", async () => {
		const state = await doTest(null, {
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

		const state = await doTest([]);
		expect(state.requests.c1).toBeUndefined();
	});
});
