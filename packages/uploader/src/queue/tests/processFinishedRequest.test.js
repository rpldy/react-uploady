import getQueueState from "./mocks/getQueueState.mock";
import  "./mocks/batchHelpers.mock";
import { FILE_STATES } from "@rpldy/shared";
import { UPLOADER_EVENTS } from "../../consts";
import processFinishedRequest from "../processFinishedRequest";
import { cleanUpFinishedBatch } from "../batchHelpers";

describe("onRequestFinished tests", () => {

	const mockNext = jest.fn();

	beforeEach(() => {
		clearJestMocks(
			cleanUpFinishedBatch,
			mockNext);
	});

	it("for single item should finalize if last file in batch", async () => {

		const batch = { id: "b1" };
		const queueState = getQueueState({
			currentBatch: "b1",
			items: {
				"u1": { batchId: "b1" },
			},
			batches: {
				b1: { batch, batchOptions: {} },
			},
			itemQueue: ["u1"],
			activeIds: ["u1"],
		});

		await processFinishedRequest(queueState, [{
			id: "u1",
			info: {
				state: FILE_STATES.FINISHED,
				response: { success: true }
			}
		}], mockNext);

		expect(queueState.state.items.u1).toEqual({
			batchId: "b1",
			state: FILE_STATES.FINISHED,
			uploadResponse: { success: true },
		});

		expect(cleanUpFinishedBatch).toHaveBeenCalledTimes(1);
		expect(mockNext).toHaveBeenCalledTimes(1);
		expect(queueState.trigger).toHaveBeenCalledWith(UPLOADER_EVENTS.FILE_FINISH, queueState.state.items.u1);
		expect(queueState.updateState).toHaveBeenCalledTimes(1);
		expect(queueState.getCurrentActiveCount).not.toHaveBeenCalled();

		expect(queueState.state.itemQueue).toHaveLength(0);
		expect(queueState.state.activeIds).toHaveLength(0);
	});

	it("for single item should continue to next item in batch after previous finished", async () => {
		const batch = { id: "b1" };
		const queueState = getQueueState({
			currentBatch: "b1",
			items: {
				"u1": { batchId: "b1" },
				"u2": { batchId: "b1" },
			},
			batches: {
				b1: { batch, batchOptions: {} },
			},
			itemQueue: ["u1", "u2"],
			activeIds: ["u1"],
		});

		await processFinishedRequest(queueState, [{
			id: "u1",
			info: {
				state: FILE_STATES.FINISHED,
				response: { success: true }
			}
		}], mockNext);

		expect(cleanUpFinishedBatch).toHaveBeenCalledTimes(1);
		expect(mockNext).toHaveBeenCalledTimes(1);
		expect(queueState.trigger).toHaveBeenCalledWith(UPLOADER_EVENTS.FILE_FINISH, queueState.state.items.u1);
		expect(queueState.updateState).toHaveBeenCalledTimes(1);
		expect(queueState.state.itemQueue).toHaveLength(1);
		expect(queueState.state.activeIds).toHaveLength(0);
	});

	it("for group should trigger and finalize ", async () => {

		const batch = { id: "b1" };
		const queueState = getQueueState({
			currentBatch: "b1",
			items: {
				"u1": { batchId: "b1" },
				"u2": { batchId: "b1" },
			},
			batches: {
				b1: { batch, batchOptions: {} },
			},
			itemQueue: ["u1", "u2"],
			activeIds: ["u1", "u2"],
		});

		await processFinishedRequest(queueState, [{
			id: "u1",
			info: {
				state: FILE_STATES.FINISHED,
				response: { success: true }
			}
		},
			{
				id: "u2",
				info: {
					state: FILE_STATES.ERROR,
					response: { success: false },
				}
			}], mockNext);

		expect(queueState.state.items.u1).toEqual({
			batchId: "b1",
			state: FILE_STATES.FINISHED,
			uploadResponse: { success: true },
		});

		expect(queueState.state.items.u2).toEqual({
			batchId: "b1",
			state: FILE_STATES.ERROR,
			uploadResponse: { success: false },
		});

		expect(cleanUpFinishedBatch).toHaveBeenCalledTimes(1);
		expect(mockNext).toHaveBeenCalledTimes(1);
		expect(queueState.trigger).toHaveBeenNthCalledWith(1, UPLOADER_EVENTS.FILE_FINISH, queueState.state.items.u1);
		expect(queueState.trigger).toHaveBeenNthCalledWith(2, UPLOADER_EVENTS.FILE_ERROR, queueState.state.items.u2);
		expect(queueState.updateState).toHaveBeenCalledTimes(2);
		expect(queueState.getCurrentActiveCount).not.toHaveBeenCalled();

		expect(queueState.state.itemQueue).toHaveLength(0);
		expect(queueState.state.activeIds).toHaveLength(0);

	});
});
