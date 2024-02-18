/* eslint vitest/expect-expect: ["error", { "assertFunctionNames": ["expect", "testSingleItem"] }] */
import getQueueState, { realUnwrap } from "./mocks/getQueueState.mock";
import { FILE_STATES } from "@rpldy/shared";
import { UPLOADER_EVENTS } from "../../consts";
import { cleanUpFinishedBatches, incrementBatchFinishedCounter, getBatchDataFromItemId } from "../batchHelpers";
import processFinishedRequest, { FILE_STATE_TO_EVENT_MAP } from "../processFinishedRequest";

vi.mock("../batchHelpers");

describe("onRequestFinished tests", () => {
	const mockNext = vi.fn();

	beforeEach(() => {
		clearViMocks(
			cleanUpFinishedBatches,
            incrementBatchFinishedCounter,
			mockNext
        );
	});

	const testSingleItem = async (activeIds =  ["u1"], completed = 100, itemId = "u1", state = FILE_STATES.FINISHED) => {
		const batch = { id: "b1" };
		const response = { success: true };
		const queueState = getQueueState({
			currentBatch: batch.id,
			items: {
				"u1": { batchId: batch.id, completed, file: { size: 1234 } },
				"u2": { batchId: batch.id, completed, url: "myfile.com" },
			},
			batches: {
				[batch.id]: { batch, batchOptions: {} },
			},
			itemQueue: { [batch.id]: [itemId] },
            batchQueue: [batch.id],
			activeIds,
			aborts: {
				[itemId]: "abort",
			}
		});

        getBatchDataFromItemId.mockReturnValueOnce(queueState.getState().batches[batch.id]);

		await processFinishedRequest(queueState, [{
			id: itemId,
			info: {
				state,
                status: 201,
				response,
			}
		}], mockNext);

		expect(queueState.getState().items[itemId]).toMatchObject({
			batchId: batch.id,
			state,
            uploadStatus: 201,
			uploadResponse: { success: true },
		});

		expect(cleanUpFinishedBatches).toHaveBeenCalledTimes(1);
		expect(mockNext).toHaveBeenCalledTimes(1);

		const finishedItem = expect.objectContaining({
            batchId: batch.id,
			state: FILE_STATES.FINISHED,
			uploadResponse: response,
			completed,
			...queueState.getState().items[itemId]
		});

        const stateBatchOptions =  queueState.getState().batches[batch.id].batchOptions;

        if (state === UPLOADER_EVENTS.ITEM_FINISH) {
            expect(queueState.trigger).toHaveBeenCalledWith(UPLOADER_EVENTS.ITEM_FINISH, finishedItem, stateBatchOptions);
        }

		expect(queueState.trigger).toHaveBeenCalledWith(UPLOADER_EVENTS.ITEM_FINALIZE, finishedItem,stateBatchOptions);
        expect(incrementBatchFinishedCounter).toHaveBeenCalledWith(expect.any(Object), batch.id);

        expect(queueState.updateState).toHaveBeenCalledTimes(2);
        expect(queueState.getCurrentActiveCount).not.toHaveBeenCalled();

		expect(queueState.getState().itemQueue[batch.id]).toHaveLength(0);
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
			item, 100, item.file.size, item.file.size);
	});

	it("should handle url item progress if not complete === 100", async () => {
		const test = await testSingleItem(["u2"], 99, "u2");

		const item = test.queueState.getState().items["u2"];
		expect(test.queueState.handleItemProgress).toHaveBeenCalledWith(
			item, 100, 0, 0);
	});

	it("for single item should finalize if last file in batch without active id found", async () => {
		await testSingleItem([]);
	});

	it("for single item should continue to next item in batch after previous finished", async () => {
		const batch = { id: "b1" };
		const response = { success: true };
		const queueState = getQueueState({
			currentBatch: batch.id,
			items: {
				"u1": { batchId: batch.id },
				"u2": { batchId: batch.id },
			},
			batches: {
				[batch.id]: { batch, batchOptions: {} },
			},
            itemQueue: { [batch.id]: ["u1", "u2"] },
            batchQueue: [batch.id],
			activeIds: ["u1"],
			aborts: {
				"u1": "abort",
			},
		});

		const expectedItem = queueState.getState().items.u1;

        getBatchDataFromItemId.mockReturnValueOnce(queueState.getState().batches[batch.id]);

		await processFinishedRequest(queueState, [{
			id: "u1",
			info: {
				state: FILE_STATES.FINISHED,
				response,
			}
		}], mockNext);

		expect(cleanUpFinishedBatches).toHaveBeenCalledTimes(1);
		expect(mockNext).toHaveBeenCalledTimes(1);
		expect(queueState.trigger).toHaveBeenCalledWith(UPLOADER_EVENTS.ITEM_FINISH, expectedItem, queueState.getState().batches[batch.id].batchOptions);

		expect(queueState.updateState).toHaveBeenCalledTimes(2);
		expect(queueState.getState().itemQueue[batch.id]).toHaveLength(1);
		expect(queueState.getState().activeIds).toHaveLength(0);
		expect(queueState.getState().aborts["u1"]).toBeUndefined();
	});

	describe("non finalize state tests", () => {
		it.each([
			FILE_STATES.UPLOADING,
			FILE_STATES.ADDED,
		])("shouldn't trigger FINALIZE on state: %s", async (state) => {
			const batch = { id: "b1" };
			const response = { success: true };

			const queueState = getQueueState({
				currentBatch: batch.id,
				items: {
					"u1": { batchId: batch.id },
				},
				batches: {
					[batch.id]: { batch, batchOptions: {} },
				},
				itemQueue: { [batch.id] : ["u1"] },
				activeIds: ["u1"],
			});

            getBatchDataFromItemId.mockReturnValueOnce(queueState.getState().batches[batch.id]);

			await processFinishedRequest(queueState, [{
				id: "u1",
				info: {
					state,

					response,
				}
			}], mockNext);

			const item = queueState.getState().items.u1;
            const batchOptions = queueState.getState().batches[batch.id].batchOptions;

            expect(queueState.trigger).toHaveBeenNthCalledWith(1, FILE_STATE_TO_EVENT_MAP[state], item, batchOptions);
			expect(queueState.trigger).not.toHaveBeenCalledWith(UPLOADER_EVENTS.ITEM_FINALIZE, item, batchOptions);
		});
	});

    it("should handle unknown finished state and not trigger finish/finalize events", async () => {
        const batch = { id: "b1" };
        const response = { success: true };

        const queueState = getQueueState({
            currentBatch: batch.id,
            items: {
                "u1": { batchId: batch.id },
            },
            batches: {
                [batch.id]: { batch, batchOptions: {} },
            },
            itemQueue: { [batch.id] : ["u1"] },
            activeIds: ["u1"],
        });

        getBatchDataFromItemId.mockReturnValueOnce(queueState.getState().batches[batch.id]);

        await processFinishedRequest(queueState, [{
            id: "u1",
            info: {
                state: "UNKNOWN",
                response,
            }
        }], mockNext);

        expect(queueState.trigger).not.toHaveBeenCalled();
    });

	describe("finalize with fail state tests", () => {
		it.each([
			FILE_STATES.ABORTED,
			FILE_STATES.CANCELLED,
			FILE_STATES.ERROR,
		])("for group should trigger and finalize", async (failState) => {
			const batch = { id: "b1" };
			const response = { success: true };
			const response2 = { success: false };

			const queueState = getQueueState({
				currentBatch: batch.id,
				items: {
					"u1": { id: "u1", batchId: batch.id },
					"u2": { id: "u2", batchId: batch.id },
				},
				batches: {
					b1: { batch, batchOptions: {} },
				},
				itemQueue: { [batch.id] : ["u1", "u2"] },
				activeIds: ["u1", "u2"],
				aborts: {
					"u1": "abort1",
					"u2": "abort2",
				}
			});

            getBatchDataFromItemId
                .mockReturnValueOnce(queueState.getState().batches[batch.id])
                .mockReturnValueOnce(queueState.getState().batches[batch.id]);

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
                        status: 400,
						response: response2,
					}
				}], mockNext);

			expect(queueState.getState().items.u1.state).toBe(FILE_STATES.FINISHED);

			expect(realUnwrap(queueState.getState().items.u1.uploadResponse)).toMatchObject(realUnwrap(response));

			const item1 = queueState.getState().items.u1;
			const item2 = queueState.getState().items.u2;
            const batchOptions = queueState.getState().batches[batch.id].batchOptions;

            expect(queueState.getState().items.u2.uploadStatus).toBe(400);
			expect(queueState.getState().items.u2).toEqual(item2);

			expect(cleanUpFinishedBatches).toHaveBeenCalledTimes(1);
			expect(mockNext).toHaveBeenCalledTimes(1);
			expect(queueState.trigger).toHaveBeenNthCalledWith(1, UPLOADER_EVENTS.ITEM_FINISH, item1, batchOptions);
			expect(queueState.trigger).toHaveBeenNthCalledWith(2, UPLOADER_EVENTS.ITEM_FINALIZE, item1, batchOptions);
			expect(queueState.trigger).toHaveBeenNthCalledWith(3, FILE_STATE_TO_EVENT_MAP[failState], item2, batchOptions);
			expect(queueState.trigger).toHaveBeenNthCalledWith(4, UPLOADER_EVENTS.ITEM_FINALIZE, item2, batchOptions);

			expect(queueState.updateState).toHaveBeenCalledTimes(4);
			expect(queueState.getCurrentActiveCount).not.toHaveBeenCalled();

			expect(queueState.getState().itemQueue[batch.id]).toHaveLength(0);
			expect(queueState.getState().activeIds).toHaveLength(0);

			expect(queueState.getState().aborts[item1.id]).toBeUndefined();
			expect(queueState.getState().aborts[item2.id]).toBeUndefined();
		});
	});

	it("should do not trigger event if id not found in items", async () => {
        const batch = { id: "b1" };

		const queueState = getQueueState({
			currentBatch: batch.id,
			items: {},
			batches: {
				[batch.id]: { batch, batchOptions: {} },
			},
			itemQueue: { [batch.id] : ["u1"] },
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
		expect(queueState.getState().activeIds).toHaveLength(0);

        //itemHelpers cant remove from itemQueue without item.batchId
        expect(queueState.getState().itemQueue[batch.id]).toHaveLength(1);
	});

    it("should handle if item no found in itemQueue", async () => {
        const queueState = getQueueState({
            currentBatch: "b1",
            items: {},
            batches: {
                b1: { batch: {}, batchOptions: {} },
            },
            itemQueue: { "b1": [] },
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
        expect(queueState.getState().itemQueue["b1"]).toHaveLength(0);
        expect(queueState.getState().activeIds).toHaveLength(0);
    });
});
