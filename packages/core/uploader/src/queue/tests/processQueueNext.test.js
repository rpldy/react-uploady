import { FILE_STATES } from "@rpldy/shared";

jest.mock("../processBatchItems", () => jest.fn());
import "./mocks/batchHelpers.mock";
import getQueueState from "./mocks/getQueueState.mock";
import mockProcessBatchItems from "../processBatchItems";
import {
	isNewBatchStarting,
	loadNewBatchForItem,
	cancelBatchForItem,
    failBatchForItem,
    getIsBatchReady,
} from "../batchHelpers";
import processQueueNext, { getNextIdGroup, findNextItemIndex } from "../processQueueNext";

describe("processQueueNext tests", () => {
	beforeAll(()=>{
        getIsBatchReady.mockReturnValue(true);
	});

	beforeEach(() => {
		clearJestMocks(
			mockProcessBatchItems,
			isNewBatchStarting,
			loadNewBatchForItem,
			cancelBatchForItem,
            failBatchForItem,
            getIsBatchReady
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
				itemQueue: { "b1": ["u1", "u2", "u3", "u4"] },
				batchQueue: ["b1"],
			});

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
                itemQueue: { "b1": ["u1"], "b2": [ "u2", "u3", "u4"] },
                batchQueue: ["b1", "b2"],
			});

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
                itemQueue: { "b1": ["u1", "u2", "u3", "u4"] },
                batchQueue: ["b1"],
            });

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
				itemQueue: { "b1": ["u1", "u2", "u3", "u4"], "b2": ["u5"] },
                batchQueue: ["b1", "b2"],
			});

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
                itemQueue: { "b1": ["u1", ], "b2": ["u2", "u3", "u4"], "b3": ["u5"] },
                batchQueue: ["b1", "b2", "b3"],
			});

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
				itemQueue: { "b1": ["u1", "u2", "u3", "u4"], "b2":  ["u5"] },
                batchQueue: ["b1", "b2"],
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
				itemQueue: { "b1": ["u1"] },
                batchQueue: ["b1"],
			});

			const ids = getNextIdGroup(queueState);

			expect(ids).toBeUndefined();
		});
	});

	describe("findNextNotActiveItemIndex tests", () => {
		it("should skip non-ready batches", () => {
			const queueState = getQueueState({
				currentBatch: "b1",
				batches: {
				},
				items: {
					"u5": {state: FILE_STATES.ADDED}
				},
				activeIds: ["u1"],
				itemQueue: { "b1": ["u1"],  "b2": ["u2"], "b3": ["u3"], "b4": ["u5"], "b5": ["u5"] },
                batchQueue: ["b1", "b2", "b3", "b4", "b5"],
			});

            getIsBatchReady
                .mockReturnValueOnce(false)
                .mockReturnValueOnce(false)
                .mockReturnValueOnce(false);

			const nextId = findNextItemIndex(queueState);

			expect(nextId).toEqual(["b4", 0]);
		});

		it("should skip non FILE_STATES.ADDED", () => {
			const queueState = getQueueState({
				activeIds: ["u1"],
				items: {
					"u2": {state: FILE_STATES.UPLOADING},
					"u3": {state: FILE_STATES.ABORTED},
					"u4": {state: FILE_STATES.ADDED}
				},
                itemQueue: { "b1": ["u1", "u2", "u3", "u4"] },
                batchQueue: ["b1"],
			});

			const nextId = findNextItemIndex(queueState);

			expect(nextId).toEqual(["b1", 3]);
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
            itemQueue: { "b1": ["u1", "u2"] },
            batchQueue: ["b1"],
		});

		await processQueueNext(queueState);

		expect(queueState.getCurrentActiveCount).toHaveBeenCalled();
		expect(queueState.runCancellable).not.toHaveBeenCalled();
	});

    it("should process next item", async () => {
        const queueState = getQueueState({
            currentBatch: "b1",
            items: {
                "u1": { batchId: "b1", state: FILE_STATES.ADDED },
                "u2": { batchId: "b1", state: FILE_STATES.ADDED },
            },
            batches: {
                b1: {
                    batch: { id: "b1" },
                    batchOptions: {}
                },
            },
            activeIds: [],
            itemQueue: { "b1": ["u1", "u2"] },
            batchQueue: ["b1"],
        }, {});

        await processQueueNext(queueState);

        expect(mockProcessBatchItems).toHaveBeenCalledTimes(1);

        expect(mockProcessBatchItems).toHaveBeenCalledWith(
            expect.any(Object),
            ["u1"],
            expect.any(Function)
        );
    });

    it("should process next item without new batch, concurrent = true", async () => {
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
            itemQueue: { "b1": ["u1", "u2"] },
            batchQueue: ["b1"],
		}, {
			concurrent: true,
			maxConcurrent: 2,
		});

		await processQueueNext(queueState);

		expect(queueState.getCurrentActiveCount).toHaveBeenCalled();
		expect(queueState.runCancellable).not.toHaveBeenCalled();

        expect(queueState.getState().activeIds).toEqual(expect.arrayContaining(["u1", "u2"]));

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
                itemQueue: { "b1": ["u1"], "b2": ["u2"] },
                batchQueue: ["b1", "b2"],
			},
			{
				concurrent: true,
				maxConcurrent: 2,
			});

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
                itemQueue: { "b1": ["u1"], "b2": ["u2"] },
                batchQueue: ["b2"],
			},
			{
				concurrent: true,
				maxConcurrent: 2,
			});

		isNewBatchStarting.mockReturnValueOnce(true);
		loadNewBatchForItem.mockResolvedValueOnce(false);

		cancelBatchForItem.mockImplementationOnce(() => {
		    queueState.updateState((state) => {
		        state.itemQueue = { "b2": [] }; //clear queue process so next doesnt work recursively
            });
		});

		await processQueueNext(queueState);

		expect(cancelBatchForItem)
			.toHaveBeenCalledWith(queueState, "u2");

		expect(mockProcessBatchItems).not.toHaveBeenCalled();
	});

    it("should handle next item after concurrent max is passed", async () => {
        const queueState = getQueueState({
                currentBatch: "b1",
                items: {
                    "u1": { batchId: "b1", state: FILE_STATES.ADDED },
                    "u2": { batchId: "b1", state: FILE_STATES.ADDED },
                    "u3": { batchId: "b1", state: FILE_STATES.ADDED },
                },
                batches: {
                    b1: {
                        batch: { id: "b1" },
                        batchOptions: {}
                    },
                },
                activeIds: [],
                itemQueue: { "b1": ["u1", "u2", "u3"] },
                batchQueue: ["b1"],
            },
            {
                concurrent: true,
                maxConcurrent: 2,
            });

        await processQueueNext(queueState);

        expect(mockProcessBatchItems).toHaveBeenCalledTimes(2);

        expect(queueState.getState().activeIds)
            .toEqual(expect.arrayContaining(["u1", "u2"]));
    });

    it("should set item as active before loading new batch", async () => {
        const queueState = getQueueState({
                currentBatch: "",
                items: {
                    "u1": { batchId: "b1", state: FILE_STATES.ADDED },
                },
                batches: {
                    b1: {
                        batch: { id: "b1" },
                        batchOptions: {}
                    },
                },
                activeIds: [],
                itemQueue: { "b1": ["u1"] },
                batchQueue: ["b1"],
            },
            {
                concurrent: true,
                maxConcurrent: 2,
            });

        isNewBatchStarting.mockReturnValueOnce(true);

        loadNewBatchForItem.mockReturnValueOnce(new Promise(() => {
        }));

        processQueueNext(queueState);

        expect(queueState.getState().activeIds).toContain("u1");
    });

    it("should handle reject from load batch", async () => {
        const queueState = getQueueState({
                currentBatch: null,
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
                activeIds: [],
                itemQueue: { "b1": ["u1"], "b2": ["u2"] },
                batchQueue: ["b1", "b2"],
            },
            {});

        const err = { error: true };
        isNewBatchStarting.mockReturnValueOnce(true);
        loadNewBatchForItem.mockRejectedValueOnce(err);

        await processQueueNext(queueState);

        expect(failBatchForItem).toHaveBeenCalledWith(expect.any(Object), "u2", err);
    });
});
