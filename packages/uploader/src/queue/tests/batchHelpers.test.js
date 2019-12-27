import { UPLOADER_EVENTS } from "../../consts";
import getQueueState from "./mocks/getQueueState.mock";
import * as batchHelpers from "../batchHelpers";

describe("batchHelpers tests", () => {

	describe("isBatchFinished tests", () => {

		it("should be finished when no items in queue", () => {
			const queueState = getQueueState({
				itemQueue: []
			});

			expect(batchHelpers.isBatchFinished(queueState)).toBe(true);
		});

		it("should be finished when new batch is starting", () => {
			const queueState = getQueueState({
				currentBatch: "b1",
				itemQueue: ["u2"],
				items: {
					"u2": {batchId: "b2"}
				},
				batches: {
					"b2": { batch: { id: "b2" } }
				}
			});

			expect(batchHelpers.isBatchFinished(queueState)).toBe(true);
		});

		it("shouldn't be finished when items in queue part of same batch", () => {
			const queueState = getQueueState({
				currentBatch: "b1",
				itemQueue: ["u2"],
				items: {
					"u2": {batchId: "b1"}
				},
				batches: {
					"b1": { batch: { id: "b1" } }
				}
			});

			expect(batchHelpers.isBatchFinished(queueState)).toBe(false);
		});
	});

	describe("cleanUpFinishedBatch tests", () => {

		it("should finalize batch if no more uploads in queue", () => {

			const batch = {};

			const queueState = getQueueState({
				currentBatch: "b1",
				batches: {
					b1: { batch },
				},
			});

			batchHelpers.cleanUpFinishedBatch(queueState);

			expect(queueState.updateState).toHaveBeenCalledTimes(1);
			expect(queueState.state.batches.b1).toBeUndefined();
			expect(queueState.trigger).toHaveBeenCalledWith(UPLOADER_EVENTS.BATCH_FINISH, batch);
		});

		it("should finalize batch if next upload is from different batch", () => {

			const batch = {};

			const queueState = getQueueState({
				currentBatch: "b1",
				batches: {
					b1: { batch },
					b2: {
						batch: { id: "b2" },
					}
				},
				items: {
					"u2": { batchId: "b2" }
				},
				itemQueue: ["u2"]
			});

			batchHelpers.cleanUpFinishedBatch(queueState);

			expect(queueState.updateState).toHaveBeenCalledTimes(1);
			expect(queueState.state.batches.b1).toBeUndefined();
			expect(queueState.trigger).toHaveBeenCalledWith(UPLOADER_EVENTS.BATCH_FINISH, batch);
		});

		it("shouldn't finalize batch if it has more uploads", () => {
			const batch = { id: "b1" };

			const queueState = getQueueState({
				currentBatch: "b1",
				batches: {
					b1: { batch },
					b2: {
						batch: { id: "b2" },
					}
				},
				items: {
					"u2": { batchId: "b1" },
					"u3": { batchId: "b2" },
				},
				itemQueue: ["u2", "u3"]
			});

			batchHelpers.cleanUpFinishedBatch(queueState);

			expect(queueState.updateState).not.toHaveBeenCalled();
			expect(queueState.state.batches.b1).toBeDefined();
			expect(queueState.trigger).not.toHaveBeenCalledWith(UPLOADER_EVENTS.BATCH_FINISH, batch);
		});

	});

	describe("loadNewBatchForItem tests", () => {
		it("should test", () => {
			throw new Error("imp");
		});
	});

	describe("isNewBatchStarting tests", () => {
		it("should test", () => {
			throw new Error("imp");
		});
	});

	describe("cancelBatchForItem tests", () => {
		it("should test", () => {
			throw new Error("imp");
		});
	});

	describe("getBatchFromItemId tests", () => {
		it("should test", () => {
			throw new Error("imp");
		});
	});

	describe("isItemBelongsToBatch tests", () => {
		it("should test", () => {
			throw new Error("imp");
		});
	});

	describe("getBatchDataFromItemId tests", () => {
		it("should test", () => {
			throw new Error("imp");
		});
	});
});

