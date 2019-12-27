jest.mock("../processBatchItems", () => jest.fn());

import mockBatchHelpers from "./mocks/batchHelpers.mock";
import getQueueState from "./mocks/getQueueState.mock";
import processQueueNext, { getNextIdGroup } from "../processQueueNext";
import mockProcessBatchItems from "../processBatchItems";

describe("processQueueNext tests", () => {

	beforeEach(() => {
		clearJestMocks(
			mockProcessBatchItems,
			...Object.values(mockBatchHelpers),
		)
	});

	describe("getNextIdGroup tests", () => {

		it("should return the next id without grouping", () => {
			const batch = { id: "b1" };

			const queueState = getQueueState({
				currentBatch: "b1",
				items: {
					"u1": { batchId: "b1" },
					"u2": { batchId: "b1" },
					"u3": { batchId: "b1" },
					"u4": { batchId: "b1" },
				},
				batches: {
					b1: {
						batch,
						batchOptions: {}
					},
				},
				activeIds: ["u1"],
				itemQueue: ["u1", "u2", "u3", "u4"],
			});

			mockBatchHelpers.getBatchDataFromItemId
				.mockReturnValueOnce(queueState.state.batches.b1);

			const ids = getNextIdGroup(queueState);

			expect(ids).toEqual(["u2"]);
		});

		it("should return next id from different batch", () => {
			const queueState = getQueueState({
				currentBatch: "b1",
				items: {
					"u1": { batchId: "b1" },
					"u2": { batchId: "b2" },
					"u3": { batchId: "b2" },
					"u4": { batchId: "b2" },
				},
				batches: {
					b1: {
						batch: { id: "b1" },
						batchOptions: {}
					},
					b2: {
						batch: { id: "b2" },
						batchOptions: {}
					}
				},
				activeIds: ["u1"],
				itemQueue: ["u1", "u2", "u3", "u4"],
			});

			mockBatchHelpers.getBatchDataFromItemId
				.mockReturnValueOnce(queueState.state.batches.b2);

			const ids = getNextIdGroup(queueState);

			expect(ids).toEqual(["u2"]);
		});

		it("should group files into single upload", () => {
			const batch = { id: "b1" };

			const queueState = getQueueState({
				currentBatch: "b1",
				items: {
					"u1": { batchId: "b1" },
					"u2": { batchId: "b1" },
					"u3": { batchId: "b1" },
					"u4": { batchId: "b1" },
				},
				batches: {
					b1: {
						batch,
						batchOptions: {
							grouped: true,
							maxGroupSize: 2,
						}
					},
				},
				activeIds: ["u1"],
				itemQueue: ["u1", "u2", "u3", "u4"],
			});

			mockBatchHelpers.getBatchDataFromItemId
				.mockReturnValueOnce(queueState.state.batches.b1);

			mockBatchHelpers.isItemBelongsToBatch
				.mockReturnValueOnce(true);

			const ids = getNextIdGroup(queueState);

			expect(ids).toEqual(["u2", "u3"]);
		});

		it("should group files only from same batch", () => {
			const queueState = getQueueState({
				currentBatch: "b1",
				items: {
					"u1": { batchId: "b1" },
					"u2": { batchId: "b1" },
					"u3": { batchId: "b1" },
					"u4": { batchId: "b1" },
					"u5": { batchId: "b2" },
				},
				batches: {
					b1: {
						batch: { id: "b1" },
						batchOptions: {
							grouped: true,
							maxGroupSize: 4,
						}
					},
				},
				activeIds: ["u1"],
				itemQueue: ["u1", "u2", "u3", "u4", "u5"],
			});

			mockBatchHelpers.getBatchDataFromItemId
				.mockReturnValueOnce(queueState.state.batches.b1);

			mockBatchHelpers.isItemBelongsToBatch
				.mockReturnValueOnce(true)
				.mockReturnValueOnce(true);

			const ids = getNextIdGroup(queueState);

			expect(ids).toEqual(["u2", "u3", "u4"]);
		});

		it("should group files starting from new batch", () => {
			const queueState = getQueueState({
				currentBatch: "b1",
				items: {
					"u1": { batchId: "b1" },
					"u2": { batchId: "b2" },
					"u3": { batchId: "b2" },
					"u4": { batchId: "b2" },
					"u5": { batchId: "b3" },
				},
				batches: {
					b1: {
						batch: { id: "b1" },
					},
					b2: {
						batch: { id: "b2" },
						batchOptions: {
							grouped: true,
							maxGroupSize: 4,
						}
					}
				},
				activeIds: ["u1"],
				itemQueue: ["u1", "u2", "u3", "u4", "u5"],
			});

			mockBatchHelpers.getBatchDataFromItemId
				.mockReturnValueOnce(queueState.state.batches.b2);

			mockBatchHelpers.isItemBelongsToBatch
				.mockReturnValueOnce(true)
				.mockReturnValueOnce(true);

			const ids = getNextIdGroup(queueState);

			expect(ids).toEqual(["u2", "u3", "u4"]);
		});

		it("should return nothing in case all items already active", () => {

			const queueState = getQueueState({
				currentBatch: "b1",
				items: {
					"u1": { batchId: "b1" },
					"u2": { batchId: "b1" },
					"u3": { batchId: "b1" },
					"u4": { batchId: "b1" },
					"u5": { batchId: "b2" },
				},
				batches: {
					b1: {
						batch: { id: "b1" },
						batchOptions: {
							grouped: true,
							maxGroupSize: 4,
						}
					},
				},
				activeIds: ["u1", ["u2", "u3"], "u4", "u5"],
				itemQueue: ["u1", "u2", "u3", "u4", "u5"],
			});

			const ids = getNextIdGroup(queueState);

			expect(ids).toBeUndefined();
		});

		it("should return nothing in case nothing in queue", () => {
			const queueState = getQueueState({
				currentBatch: "b1",
				items: {
					"u1": { batchId: "b1" },
				},
				batches: {
					b1: {
						batch: { id: "b1" },
						batchOptions: {
							grouped: true,
							maxGroupSize: 4,
						}
					},
				},
				activeIds: ["u1"],
				itemQueue: ["u1"],
			});

			const ids = getNextIdGroup(queueState);

			expect(ids).toBeUndefined();
		});
	});

	it("should do nothing if no next ids", async () => {

		const queueState = getQueueState();

		await processQueueNext(queueState);

		expect(queueState.getCurrentActiveCount).not.toHaveBeenCalled();
	});

	it("should do nothing if already active upload and no concurrent ", async () => {

		const queueState = getQueueState({
			currentBatch: "b1",
			items: {
				"u1": { batchId: "b1" },
				"u2": { batchId: "b1" },
			},
			batches: {
				b1: {
					batch: { id: "b1" },
					batchOptions: {}
				},
			},
			activeIds: ["u1"],
			itemQueue: ["u1", "u2"],
		});

		mockBatchHelpers.getBatchDataFromItemId.mockReturnValueOnce(
			queueState.state.batches.b1
		);

		await processQueueNext(queueState);

		expect(queueState.getCurrentActiveCount).toHaveBeenCalled();
		expect(queueState.cancellable).not.toHaveBeenCalled();
	});

	it("should process next item without new batch", async () => {
		const queueState = getQueueState({
			currentBatch: "b1",
			items: {
				"u1": { batchId: "b1" },
				"u2": { batchId: "b1" },
			},
			batches: {
				b1: {
					batch: { id: "b1" },
					batchOptions: {}
				},
			},
			activeIds: ["u1"],
			itemQueue: ["u1", "u2"],
		}, {
			concurrent: true,
			maxConcurrent: 2,
		});

		mockBatchHelpers.getBatchDataFromItemId.mockReturnValueOnce(
			queueState.state.batches.b1
		);

		await processQueueNext(queueState);

		expect(queueState.getCurrentActiveCount).toHaveBeenCalled();
		expect(queueState.cancellable).not.toHaveBeenCalled();

		expect(mockProcessBatchItems).toHaveBeenCalledWith(
			expect.any(Object),
			["u2"],
			expect.any(Function)
		);
	});

	it("should process next item from new batch", async () => {

		const queueState = getQueueState({
				currentBatch: "b1",
				items: {
					"u1": { batchId: "b1" },
					"u2": { batchId: "b2" },
				},
				batches: {
					b2: {
						batch: { id: "b2" },
						batchOptions: {}
					},
				},
				activeIds: ["u1"],
				itemQueue: ["u1", "u2"],
			},
			{
				concurrent: true,
				maxConcurrent: 2,
			});

		mockBatchHelpers.getBatchDataFromItemId.mockReturnValueOnce(
			queueState.state.batches.b2
		);

		mockBatchHelpers.isNewBatchStarting.mockReturnValueOnce(true);
		mockBatchHelpers.loadNewBatchForItem.mockResolvedValueOnce(true);

		await processQueueNext(queueState);

		expect(mockBatchHelpers.loadNewBatchForItem).toHaveBeenCalledWith(queueState, "u2");

		expect(mockProcessBatchItems).toHaveBeenCalledWith(
			expect.any(Object),
			["u2"],
			expect.any(Function)
		);
	});

	it("should handle next item from cancelled new batch", async () => {

		const queueState = getQueueState({
				currentBatch: "b1",
				items: {
					"u1": { batchId: "b1" },
					"u2": { batchId: "b2" },
				},
				batches: {
					b2: {
						batch: { id: "b2" },
						batchOptions: {}
					},
				},
				activeIds: ["u1"],
				itemQueue: ["u1", "u2"],
			},
			{
				concurrent: true,
				maxConcurrent: 2,
			});

		mockBatchHelpers.getBatchDataFromItemId.mockReturnValueOnce(
			queueState.state.batches.b2
		);

		mockBatchHelpers.isNewBatchStarting.mockReturnValueOnce(true);
		mockBatchHelpers.loadNewBatchForItem.mockResolvedValueOnce(false);

		mockBatchHelpers.cancelBatchForItem.mockImplementationOnce(()=>{
			queueState.state.itemQueue = []; //clear queue process next doesnt work recursively
		});

		await processQueueNext(queueState);

		expect(mockBatchHelpers.cancelBatchForItem)
			.toHaveBeenCalledWith("u2");

		expect(mockProcessBatchItems).not.toHaveBeenCalled();
	});
});