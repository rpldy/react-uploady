import { FILE_STATES } from "@rpldy/shared";

jest.mock("../processBatchItems", () => jest.fn());
import "./mocks/batchHelpers.mock";
import getQueueState from "./mocks/getQueueState.mock";
import mockProcessBatchItems from "../processBatchItems";
import {
	getBatchDataFromItemId,
	isItemBelongsToBatch,
	isNewBatchStarting,
	loadNewBatchForItem,
	cancelBatchForItem,
	getIsItemBatchReady,
} from "../batchHelpers";
import processQueueNext, { getNextIdGroup, findNextItemIndex } from "../processQueueNext";

describe("processQueueNext tests", () => {

	beforeAll(()=>{
		getIsItemBatchReady.mockReturnValue(true);
	});

	beforeEach(() => {
		clearJestMocks(
			mockProcessBatchItems,
			getBatchDataFromItemId,
			isItemBelongsToBatch,
			isNewBatchStarting,
			loadNewBatchForItem,
			cancelBatchForItem,
			getIsItemBatchReady
		);
	});

	describe("getNextIdGroup tests", () => {

		it("should return the next id without grouping", () => {
			const batch = { id: "b1" };

			const queueState = getQueueState({
				currentBatch: "b1",
				items: {
					"u1": { batchId: "b1" },
					"u2": { batchId: "b1", state: FILE_STATES.ADDED },
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

			getBatchDataFromItemId
				.mockReturnValueOnce(queueState.state.batches.b1);

			const ids = getNextIdGroup(queueState);

			expect(ids).toEqual(["u2"]);
		});

		it("should return next id from different batch", () => {
			const queueState = getQueueState({
				currentBatch: "b1",
				items: {
					"u1": { batchId: "b1" },
					"u2": { batchId: "b2", state: FILE_STATES.ADDED },
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

			getBatchDataFromItemId
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
					"u2": { batchId: "b1", state: FILE_STATES.ADDED },
					"u3": { batchId: "b1", state: FILE_STATES.ADDED },
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

			getBatchDataFromItemId
				.mockReturnValueOnce(queueState.state.batches.b1);

			isItemBelongsToBatch
				.mockReturnValueOnce(true);

			const ids = getNextIdGroup(queueState);

			expect(ids).toEqual(["u2", "u3"]);
		});

		it("should group files only from same batch", () => {
			const queueState = getQueueState({
				currentBatch: "b1",
				items: {
					"u1": { batchId: "b1" },
					"u2": { batchId: "b1", state: FILE_STATES.ADDED },
					"u3": { batchId: "b1", state: FILE_STATES.ADDED },
					"u4": { batchId: "b1", state: FILE_STATES.ADDED },
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

			getBatchDataFromItemId
				.mockReturnValueOnce(queueState.state.batches.b1);

			isItemBelongsToBatch
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
					"u2": { batchId: "b2", state: FILE_STATES.ADDED },
					"u3": { batchId: "b2", state: FILE_STATES.ADDED },
					"u4": { batchId: "b2", state: FILE_STATES.ADDED },
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

			getBatchDataFromItemId
				.mockReturnValueOnce(queueState.state.batches.b2);

			isItemBelongsToBatch
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

	describe("findNextNotActiveItemIndex tests", () => {

		it("should skip non-ready batches", () => {

			getIsItemBatchReady
				.mockReturnValueOnce(false)
				.mockReturnValueOnce(false)
				.mockReturnValueOnce(false)
				.mockReturnValueOnce(true);

			const queueState = getQueueState({
				currentBatch: "b1",
				batches: {
				},
				items: {
					"u5": {state: FILE_STATES.ADDED}
				},
				activeIds: ["u1"],
				itemQueue: ["u1", "u2", "u3", "u4", "u5"],
			});

			const nextId = findNextItemIndex(queueState);

			expect(nextId).toBe(4);
		});

		it("should skip non FILE_STATES.ADDED", () => {

			const queueState = getQueueState({
				activeIds: ["u1"],
				items: {
					"u2": {state: FILE_STATES.UPLOADING},
					"u3": {state: FILE_STATES.ABORTED},
					"u4": {state: FILE_STATES.ADDED}
				},
				itemQueue: ["u1", "u2", "u3", "u4"],
			});

			const nextId = findNextItemIndex(queueState);

			expect(nextId).toBe(3);
		});
	});

	it("should do nothing if no next ids", async () => {

		const queueState = getQueueState();

		await processQueueNext(queueState);

		expect(queueState.getCurrentActiveCount).not.toHaveBeenCalled();
	});

	it("should do nothing if already active upload and no concurrent", async () => {

		const queueState = getQueueState({
			currentBatch: "b1",
			items: {
				"u1": { batchId: "b1" },
				"u2": { batchId: "b1", state: FILE_STATES.ADDED },
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

		getBatchDataFromItemId.mockReturnValueOnce(
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
				"u2": { batchId: "b1", state: FILE_STATES.ADDED },
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

		getBatchDataFromItemId.mockReturnValueOnce(
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
					"u2": { batchId: "b2", state: FILE_STATES.ADDED },
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

		getBatchDataFromItemId.mockReturnValueOnce(
			queueState.state.batches.b2
		);

		isNewBatchStarting.mockReturnValueOnce(true);
		loadNewBatchForItem.mockResolvedValueOnce(true);

		await processQueueNext(queueState);

		expect(loadNewBatchForItem).toHaveBeenCalledWith(queueState, "u2");

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
					"u2": { batchId: "b2", state: FILE_STATES.ADDED },
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

		getBatchDataFromItemId.mockReturnValueOnce(
			queueState.state.batches.b2
		);

		isNewBatchStarting.mockReturnValueOnce(true);
		loadNewBatchForItem.mockResolvedValueOnce(false);

		cancelBatchForItem.mockImplementationOnce(() => {
		    queueState.updateState((state) => {
		        state.itemQueue = []; //clear queue process so next doesnt work recursively
            });
		});

		await processQueueNext(queueState);

		expect(cancelBatchForItem)
			.toHaveBeenCalledWith(queueState, "u2");

		expect(mockProcessBatchItems).not.toHaveBeenCalled();
	});
});
