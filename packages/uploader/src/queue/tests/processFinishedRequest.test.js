import getQueueState from "./mocks/getQueueState.mock";
import "./mocks/batchHelpers.mock";
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

	const testSingleItem = async (activeIds) => {
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
            activeIds: activeIds || ["u1"],
        });

        await processFinishedRequest(queueState, [{
            id: "u1",
            info: {
                state: FILE_STATES.FINISHED,
                response,
            }
        }], mockNext);

        expect(queueState.getState().items.u1).toEqual({
            batchId: "b1",
            state: FILE_STATES.FINISHED,
            uploadResponse: { success: true },
        });

        expect(cleanUpFinishedBatch).toHaveBeenCalledTimes(1);
        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(queueState.trigger).toHaveBeenCalledWith(UPLOADER_EVENTS.ITEM_FINISH,
            {
                batchId: "b1",
                state: FILE_STATES.FINISHED,
                uploadResponse: response,
            });
        expect(queueState.updateState).toHaveBeenCalledTimes(2);
        expect(queueState.getCurrentActiveCount).not.toHaveBeenCalled();

        expect(queueState.getState().itemQueue).toHaveLength(0);
        expect(queueState.getState().activeIds).toHaveLength(0);
    };

	it("for single item should finalize if last file in batch", async () => {
        await testSingleItem();
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
	});

	it("for group should trigger and finalize ", async () => {

		const batch = { id: "b1" };
		const response = { success: true };
		const response2 = { success: false };

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
				response,
			}
		},
			{
				id: "u2",
				info: {
					state: FILE_STATES.ERROR,
					response: response2,
				}
			}], mockNext);

		const item1 = {
			batchId: "b1",
			state: FILE_STATES.FINISHED,
			uploadResponse: response,
		};
		expect(queueState.getState().items.u1).toEqual(item1);

		const item2 = {
			batchId: "b1",
			state: FILE_STATES.ERROR,
			uploadResponse: response2
		};

		expect(queueState.getState().items.u2).toEqual(item2);

		expect(cleanUpFinishedBatch).toHaveBeenCalledTimes(1);
		expect(mockNext).toHaveBeenCalledTimes(1);
		expect(queueState.trigger).toHaveBeenNthCalledWith(1, UPLOADER_EVENTS.ITEM_FINISH, item1);
		expect(queueState.trigger).toHaveBeenNthCalledWith(2, UPLOADER_EVENTS.ITEM_ERROR, item2);
		expect(queueState.updateState).toHaveBeenCalledTimes(4);
		expect(queueState.getCurrentActiveCount).not.toHaveBeenCalled();

		expect(queueState.getState().itemQueue).toHaveLength(0);
		expect(queueState.getState().activeIds).toHaveLength(0);

	});

	it("should do not trigger event if id not found in items", async () => {

		const queueState = getQueueState({
			currentBatch: "b1",
			items: {
			},
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
			items: {
			},
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
