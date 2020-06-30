/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "testSingleItem"] }] */
import getQueueState from "./mocks/getQueueState.mock";
import "./mocks/batchHelpers.mock";
import { FILE_STATES } from "@rpldy/shared";
import { UPLOADER_EVENTS } from "../../consts";
import { cleanUpFinishedBatch } from "../batchHelpers";
import processFinishedRequest, { FILE_STATE_TO_EVENT_MAP } from "../processFinishedRequest";

describe("onRequestFinished tests", () => {

	const mockNext = jest.fn();

	beforeEach(() => {
		clearJestMocks(
			cleanUpFinishedBatch,
			mockNext);
	});

	const testSingleItem = async (activeIds, completed = 100, itemId = "u1") => {
		const batch = { id: "b1" };
		const response = { success: true };
		const queueState = getQueueState({
			currentBatch: "b1",
			items: {
				"u1": { batchId: "b1", completed, file: { size: 1234 } },
				"u2": { batchId: "b1", completed, url: "myfile.com" },
			},
			batches: {
				b1: { batch, batchOptions: {} },
			},
			itemQueue: [itemId],
			activeIds: activeIds || ["u1"],
			aborts: {
				[itemId]: "abort",
			}
		});

		await processFinishedRequest(queueState, [{
			id: itemId,
			info: {
				state: FILE_STATES.FINISHED,
				response,
			}
		}], mockNext);

		expect(queueState.getState().items[itemId]).toMatchObject({
			batchId: "b1",
			state: FILE_STATES.FINISHED,
			uploadResponse: { success: true },
		});

		expect(cleanUpFinishedBatch).toHaveBeenCalledTimes(1);
		expect(mockNext).toHaveBeenCalledTimes(1);

		const finishedItem = expect.objectContaining({
			batchId: "b1",
			state: FILE_STATES.FINISHED,
			uploadResponse: response,
			completed,
			...queueState.getState().items[itemId]
		});

		expect(queueState.trigger).toHaveBeenCalledWith(UPLOADER_EVENTS.ITEM_FINISH, finishedItem);
		expect(queueState.trigger).toHaveBeenCalledWith(UPLOADER_EVENTS.ITEM_FINALIZE, finishedItem);

		expect(queueState.updateState).toHaveBeenCalledTimes(2);
		expect(queueState.getCurrentActiveCount).not.toHaveBeenCalled();

		expect(queueState.getState().itemQueue).toHaveLength(0);
		expect(queueState.getState().activeIds).toHaveLength(0);

		expect(queueState.getState().aborts[itemId]).toBeUndefined();

		return {
			queueState
		};
	};

	it("for single item should finalize if last file in batch", async () => {
		const test = await testSingleItem();

		expect(test.queueState.handleItemProgress).not.toHaveBeenCalled();
	});

	it("should handle item progress if not complete === 100", async () => {
		const test = await testSingleItem(["u1"], 99);

		const item = test.queueState.getState().items["u1"];
		expect(test.queueState.handleItemProgress).toHaveBeenCalledWith(
			item, 100, item.file.size);
	});

	it("should handle url item progress if not complete === 100", async () => {
		const test = await testSingleItem(["u2"], 99, "u2");

		const item = test.queueState.getState().items["u2"];
		expect(test.queueState.handleItemProgress).toHaveBeenCalledWith(
			item, 100, 0);
	});

	it("for single item should finalize if last file in batch without active id found", async () => {
		await testSingleItem([]);
	});

	it("for single item should continue to next item in batch after previous finished", async () => {
		const batch = { id: "b1" };
		const response = { success: true };
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
			aborts: {
				"u1": "abort",
			},
		});

		await processFinishedRequest(queueState, [{
			id: "u1",
			info: {
				state: FILE_STATES.FINISHED,
				response,
			}
		}], mockNext);

		expect(cleanUpFinishedBatch).toHaveBeenCalledTimes(1);
		expect(mockNext).toHaveBeenCalledTimes(1);
		expect(queueState.trigger).toHaveBeenCalledWith(UPLOADER_EVENTS.ITEM_FINISH, {
			batchId: "b1",
			state: FILE_STATES.FINISHED,
			uploadResponse: response,
		});
		expect(queueState.updateState).toHaveBeenCalledTimes(2);
		expect(queueState.getState().itemQueue).toHaveLength(1);
		expect(queueState.getState().activeIds).toHaveLength(0);
		expect(queueState.getState().aborts["u1"]).toBeUndefined();
	});


	describe("non finalize state tests ", () => {
		it.each([
			FILE_STATES.UPLOADING,
			FILE_STATES.ADDED,
		])("shouldn't trigger FINALIZE on state: %s", async (state) => {
			const batch = { id: "b1" };
			const response = { success: true };

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
					state,
					response,
				}
			}], mockNext);

			const item = {
				batchId: "b1",
				state,
				uploadResponse: response
			};

			expect(queueState.trigger).toHaveBeenNthCalledWith(1, FILE_STATE_TO_EVENT_MAP[state], item);
			expect(queueState.trigger).not.toHaveBeenCalledWith(UPLOADER_EVENTS.ITEM_FINALIZE, item);
		});
	});

	describe("finalize with fail state tests", () => {
		it.each([
			FILE_STATES.ABORTED,
			FILE_STATES.CANCELLED,
			FILE_STATES.ERROR,
		])("for group should trigger and finalize ", async (failState) => {

			const batch = { id: "b1" };
			const response = { success: true };
			const response2 = { success: false };

			const queueState = getQueueState({
				currentBatch: "b1",
				items: {
					"u1": { id: "u1", batchId: "b1" },
					"u2": { id: "u2", batchId: "b1" },
				},
				batches: {
					b1: { batch, batchOptions: {} },
				},
				itemQueue: ["u1", "u2"],
				activeIds: ["u1", "u2"],
				aborts: {
					"u1": "abort1",
					"u2": "abort2",
				}
			});

			await processFinishedRequest(queueState, [{
				id: "u1",
				info: {
					state: FILE_STATES.FINISHED,
					response,
				}
			},
				{
					id: "u2",
					info: {
						state: failState,
						response: response2,
					}
				}], mockNext);

			const item1 = {
				id: "u1",
				batchId: "b1",
				state: FILE_STATES.FINISHED,
				uploadResponse: response,
			};

			expect(queueState.getState().items.u1).toEqual(item1);

			const item2 = {
				id: "u2",
				batchId: "b1",
				state: failState,
				uploadResponse: response2
			};

			expect(queueState.getState().items.u2).toEqual(item2);

			expect(cleanUpFinishedBatch).toHaveBeenCalledTimes(1);
			expect(mockNext).toHaveBeenCalledTimes(1);
			expect(queueState.trigger).toHaveBeenNthCalledWith(1, UPLOADER_EVENTS.ITEM_FINISH, item1);
			expect(queueState.trigger).toHaveBeenNthCalledWith(2, UPLOADER_EVENTS.ITEM_FINALIZE, item1);
			expect(queueState.trigger).toHaveBeenNthCalledWith(3, FILE_STATE_TO_EVENT_MAP[failState], item2);
			expect(queueState.trigger).toHaveBeenNthCalledWith(4, UPLOADER_EVENTS.ITEM_FINALIZE, item2);

			expect(queueState.updateState).toHaveBeenCalledTimes(4);
			expect(queueState.getCurrentActiveCount).not.toHaveBeenCalled();

			expect(queueState.getState().itemQueue).toHaveLength(0);
			expect(queueState.getState().activeIds).toHaveLength(0);

			expect(queueState.getState().aborts[item1.id]).toBeUndefined();
			expect(queueState.getState().aborts[item2.id]).toBeUndefined();
		});
	});

	it("should do not trigger event if id not found in items", async () => {

		const queueState = getQueueState({
			currentBatch: "b1",
			items: {},
			batches: {
				b1: { batch: {}, batchOptions: {} },
			},
			itemQueue: ["u1"],
			activeIds: ["u1"],
		});

		await processFinishedRequest(queueState, [{
			id: "u1",
			info: {
				state: FILE_STATES.FINISHED,
				response: "",
			}
		}], mockNext);

		expect(queueState.trigger).not.toHaveBeenCalled();
		expect(queueState.updateState).toHaveBeenCalledTimes(1);
		expect(queueState.getState().itemQueue).toHaveLength(0);
		expect(queueState.getState().activeIds).toHaveLength(0);
	});

	it("should do nothing if item not found", async () => {

		const queueState = getQueueState({
			currentBatch: "b1",
			items: {},
			batches: {
				b1: { batch: {}, batchOptions: {} },
			},
			itemQueue: [],
			activeIds: [],
		});

		await processFinishedRequest(queueState, [{
			id: "u1",
			info: {
				state: FILE_STATES.FINISHED,
				response: "",
			}
		}], mockNext);

		expect(queueState.trigger).not.toHaveBeenCalled();
		expect(queueState.updateState).not.toHaveBeenCalled();
		expect(queueState.getState().itemQueue).toHaveLength(0);
		expect(queueState.getState().activeIds).toHaveLength(0);
	});
});
