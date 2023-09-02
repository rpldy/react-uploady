import { UPLOADER_EVENTS } from "../../consts";
import { BATCH_STATES, FILE_STATES } from "@rpldy/shared/src/tests/mocks/rpldy-shared.mock";
import getQueueState from "./mocks/getQueueState.mock";
import { getItemsPrepareUpdater } from "../preSendPrepare";
import { finalizeItem, getIsItemExists } from "../itemHelpers";

jest.mock("../preSendPrepare");
jest.mock("../itemHelpers");

describe("batchHelpers tests", () => {
    let batchHelpers;
    const mockPrepareBatchStartItems = jest.fn();

    beforeAll(() => {
        getItemsPrepareUpdater.mockReturnValue(mockPrepareBatchStartItems);
        batchHelpers = require("../batchHelpers");
    });

    beforeEach(() => {
        clearJestMocks(
            finalizeItem,
            mockPrepareBatchStartItems,
        );
    });

    describe("cleanUpFinishedBatches tests", () => {
        it("should finalize batch if no more uploads in queue", () => {
            const item1 = { id: "u1" },
                item2 = { id: "u2" };

            const batch = {
                id: "b1",
                items: [item1, item2],
                orgItemCount: 2,
                state: BATCH_STATES.PENDING,
                completed: 100,
            };

            const batchOptions = {
                autoUpload: false,
            };

            const queueState = getQueueState({
                currentBatch: "b1",
                items: {
                    "u1": item1,
                    "u2": item2,
                    "u3": {},
                },
                batches: {
                    b1: { batch, batchOptions, finishedCounter: 2 },
                },
                batchesStartPending: ["b1"],
            });

            const expectedBatch = expect.objectContaining({
                ...queueState.getState().batches.b1.batch,
                state: BATCH_STATES.FINISHED,
                items: [queueState.getState().items.u1, queueState.getState().items.u2],
            });

            batchHelpers.cleanUpFinishedBatches(queueState);

            const updatedState = queueState.getState();

            expect(updatedState.batches.b1).toBeUndefined();
            expect(queueState.trigger).toHaveBeenCalledWith(UPLOADER_EVENTS.BATCH_FINISH, expectedBatch, batchOptions);
            expect(queueState.trigger).toHaveBeenCalledWith(UPLOADER_EVENTS.BATCH_FINALIZE, expectedBatch, batchOptions);
            expect(queueState.trigger).not.toHaveBeenCalledWith(UPLOADER_EVENTS.BATCH_PROGRESS, expect.any(Object));
            expect(finalizeItem).toHaveBeenCalledTimes(2);
            expect(finalizeItem).toHaveBeenCalledWith(expect.any(Object), "u1", true);
            expect(finalizeItem).toHaveBeenCalledWith(expect.any(Object), "u2", true);
            expect(updatedState.currentBatch).toBeNull();
            expect(updatedState.batchesStartPending).toHaveLength(0);
        });

        it("should finalize batch if no more uploads in queue for non-current batch", () => {
            const item1 = { id: "u1" },
                item2 = { id: "u2" };

            const batch = {
                id: "b1",
                items: [item1, item2],
                orgItemCount: 2,
                state: BATCH_STATES.PENDING,
                completed: 100,
            };

            const batchOptions = {
                autoUpload: false,
            };

            const queueState = getQueueState({
                currentBatch: "b0",
                items: {
                    "u1": item1,
                    "u2": item2,
                    "u3": {},
                },
                batches: {
                    b1: { batch, batchOptions, finishedCounter: 2 },
                },
                batchesStartPending: ["b1"],
            });

            const expectedBatch = expect.objectContaining({
                ...queueState.getState().batches.b1.batch,
                state: BATCH_STATES.FINISHED,
                items: [queueState.getState().items.u1, queueState.getState().items.u2],
            });

            batchHelpers.cleanUpFinishedBatches(queueState);

            const updatedState = queueState.getState();

            expect(updatedState.batches.b1).toBeUndefined();
            expect(queueState.trigger).toHaveBeenCalledWith(UPLOADER_EVENTS.BATCH_FINISH, expectedBatch, batchOptions);
            expect(queueState.trigger).not.toHaveBeenCalledWith(UPLOADER_EVENTS.BATCH_PROGRESS, expect.any(Object));
            expect(updatedState.currentBatch).toBe("b0");
            expect(updatedState.batchesStartPending).toHaveLength(0);

            expect(finalizeItem).toHaveBeenCalledTimes(2);
            expect(finalizeItem).toHaveBeenCalledWith(expect.any(Object), "u1", true);
            expect(finalizeItem).toHaveBeenCalledWith(expect.any(Object), "u2", true);
        });

        it("should finalize batch and add progress if values not completed", () => {
            const item1 = { id: "u1", loaded: 100, },
                item2 = { id: "u2", loaded: 101 };

            const batch = {
                id: "b1",
                items: [item1, item2],
                orgItemCount: 2,
                state: BATCH_STATES.PROCESSING,
                completed: 90
            };

            const batchOptions = {
                autoUpload: false,
            };

            const queueState = getQueueState({
                currentBatch: "b1",
                items: {
                    "u1": item1,
                    "u2": item2,
                    "u3": {},
                },
                batches: {
                    b1: { batch, batchOptions, finishedCounter: 2 },
                },
                batchesStartPending: [],
            });

            const expectedLastProgressBatch = expect.objectContaining({
                ...queueState.getState().batches.b1.batch,
                state: BATCH_STATES.PROCESSING,
                items: [queueState.getState().items.u1, queueState.getState().items.u2],
                completed: 100,
                loaded: 201,
            });

            const expectedFinishedBatch = expect.objectContaining({
                ...queueState.getState().batches.b1.batch,
                state: BATCH_STATES.FINISHED,
                items: [queueState.getState().items.u1, queueState.getState().items.u2],
                completed: 100,
                loaded: 201,
            });

            batchHelpers.cleanUpFinishedBatches(queueState);

            const updatedState = queueState.getState();

            expect(updatedState.batches.b1).toBeUndefined();
            expect(queueState.trigger).toHaveBeenCalledWith(UPLOADER_EVENTS.BATCH_PROGRESS, expectedLastProgressBatch, batchOptions);
            expect(queueState.trigger).toHaveBeenCalledWith(UPLOADER_EVENTS.BATCH_FINISH, expectedFinishedBatch, batchOptions);
            expect(updatedState.currentBatch).toBeNull();
        });

        it("shouldn't finalize batch if it has more uploads", () => {
            const batch = { id: "b1", items: [1, 2], orgItemCount: 2 };

            const queueState = getQueueState({
                currentBatch: "b1",
                batches: {
                    b1: { batch, finishedCounter: 1 },
                },
                itemQueue: { "b1": ["u2", "u3"] },
            });

            batchHelpers.cleanUpFinishedBatches(queueState);

            expect(queueState.updateState).not.toHaveBeenCalled();
            expect(queueState.state.batches.b1).toBeDefined();
            expect(queueState.trigger).not.toHaveBeenCalled();
        });

        it("shouldn't trigger event for already finalized but should clean", () => {
            const item1 = { id: "u1" },
                item2 = { id: "u2" };

            const batch = {
                id: "b1",
                items: [item1, item2],
                orgItemCount: 2,
                state: BATCH_STATES.ABORTED,
                completed: 100,
            };

            const queueState = getQueueState({
                currentBatch: "b1",
                items: {
                    "u1": item1,
                    "u2": item2,
                    "u3": {},
                },
                batches: {
                    b1: { batch, finishedCounter: 2 },
                },
                batchesStartPending: ["b1"],
            });

            batchHelpers.cleanUpFinishedBatches(queueState);

            const updatedState = queueState.getState();

            expect(updatedState.batches.b1).toBeUndefined();
            expect(queueState.trigger).not.toHaveBeenCalled();
            expect(updatedState.currentBatch).toBeNull();
            expect(finalizeItem).toHaveBeenCalledTimes(2);
            expect(finalizeItem).toHaveBeenCalledWith(expect.any(Object), "u1", true);
            expect(finalizeItem).toHaveBeenCalledWith(expect.any(Object), "u2", true);
            expect(updatedState.batchesStartPending).toHaveLength(0);
        });

        it("shouldn't finalize batch if no longer in state", () => {
            const queueState = getQueueState({
                currentBatch: "b1",
                batches: {}
            });

            batchHelpers.cleanUpFinishedBatches(queueState);

            expect(queueState.updateState).not.toHaveBeenCalled();
            expect(queueState.trigger).not.toHaveBeenCalled();
        });
    });

    describe("loadNewBatchForItem tests", () => {
        it("should load allowed batch", async () => {
            const queueState = getQueueState({
                currentBatch: null,
                batches: {
                    "b1": { batch: { id: "b1" }, batchOptions: {} },
                },
                items: {
                    "u1": { batchId: "b1" }
                },
                batchesStartPending: []
            });

            mockPrepareBatchStartItems.mockResolvedValueOnce({});
            getIsItemExists.mockReturnValueOnce(true);

            const allowed = await batchHelpers.loadNewBatchForItem(queueState, "u1");

            expect(allowed).toBe(true);

            expect(queueState.getState().currentBatch).toBe("b1");
            expect(queueState.getState().batchesStartPending).toHaveLength(0);
        });

        it("should return not allowed if item doesnt exist", async () => {
            const queueState = getQueueState({
                currentBatch: null,
                batches: {
                    "b1": { batch: { id: "b1" }, batchOptions: {} },
                },
                items: {
                    "u1": { batchId: "b1" }
                },
                batchesStartPending: []
            });

            mockPrepareBatchStartItems.mockResolvedValueOnce({});
            getIsItemExists.mockReturnValueOnce(false);

            const allowed = await batchHelpers.loadNewBatchForItem(queueState, "u1");

            expect(allowed).toBe(false);
            expect(queueState.getState().batchesStartPending).toHaveLength(0);
        });

        it("should cancel batch", async () => {
            const queueState = getQueueState({
                currentBatch: "b1",
                batches: {
                    "b2": { batch: { id: "b2" }, batchOptions: {} },
                },
                items: {
                    "u2": { batchId: "b2" }
                },
                batchesStartPending: []
            });

            mockPrepareBatchStartItems.mockResolvedValueOnce({ cancelled: true });
            const allowed = await batchHelpers.loadNewBatchForItem(queueState, "u2");

            expect(allowed).toBe(false);

            expect(queueState.state.currentBatch).toBe("b1");
            expect(queueState.getState().batchesStartPending).toHaveLength(0);
        });
    });

    describe("prepareBatchStartItems tests", () => {
        it("should throw if prepareBatchStartItems validator gets batch", () => {
            expect(() => getItemsPrepareUpdater.mock.calls[0][3]({ batch: {} }))
                .toThrow(`BATCH_START event handlers cannot update batch data. Only items & options`);
        });

        it("should not throw if prepareBatchStartItems validator doesnt get batch", () => {
            expect(getItemsPrepareUpdater.mock.calls[0][3]())
                .toBeUndefined();
        });

        it("should return items from batch using prepareBatchStartItems-retrieveItemsFromSubject", () => {
            const items = [1,2,3];
            expect(getItemsPrepareUpdater.mock.calls[0][1]({ items })).toBe(items);
        });
    });

	describe("isNewBatchStarting tests", () => {
		it("should return true for new batch", () => {

			const queueState = getQueueState({
				currentBatch: "b1",
				batches: {
					"b2": { batch: { id: "b2" } },
				},
				items: {
					"u2": { batchId: "b2" }
				}
			});

			const result = batchHelpers.isNewBatchStarting(queueState, "u2");

			expect(result).toBe(true);
		});

		it("should return false for same batch", () => {
			const queueState = getQueueState({
				currentBatch: "b1",
				batches: {
					"b1": { batch: { id: "b1" } },
				},
				items: {
					"u2": { batchId: "b1" }
				}
			});

			const result = batchHelpers.isNewBatchStarting(queueState, "u2");

			expect(result).toBe(false);
		});
	});

	describe("cancel Batch tests", () => {
		it("should cancel batch, remove items and batch from state", () => {
			const ids = ["u1", "u2", "u3"];
			const items = ids.reduce((res, id) =>
				({ ...res, [id]: { id, batchId: "b1" } }), {});

			const cancelledBatch = {
				id: "b1",
				items: Object.values(items).map((i) => ({ ...i, changed: true }))
			};

            const batchOptions = {
                autoUpload: false,
            };

			const queueState = getQueueState({
				items: {
					...items,
					"u4": { id: "u4", batchId: "b2" },
				},
				batches: {
					"b1": { batch: cancelledBatch, batchOptions },
					"b2": {}
				},
                itemQueue: { "b1": [...ids], "b2": ["u4"] },
                batchQueue: ["b1", "b2"],
                batchesStartPending: ["b1", "b2"],
			});

			const eventBatch = queueState.getState().batches.b1.batch,
				 eventItems = Object.values(queueState.getState().items).filter((i) => ~ids.indexOf(i.id));

            getIsItemExists.mockReturnValueOnce(true);

			batchHelpers.cancelBatchForItem(queueState, "u1");

			expect(queueState.trigger).toHaveBeenCalledWith(
				UPLOADER_EVENTS.BATCH_CANCEL,
				expect.objectContaining({
					...eventBatch,
					state: BATCH_STATES.CANCELLED,
					items: eventItems,
				}),
                batchOptions
			);

            expect(queueState.trigger).toHaveBeenCalledWith(
                UPLOADER_EVENTS.BATCH_FINALIZE,
                expect.objectContaining({
                    ...eventBatch,
                    state: BATCH_STATES.CANCELLED,
                    items: eventItems,
                }),
                batchOptions
            );

			const updatedState = queueState.getState();
			expect(updatedState.batches.b1).toBeUndefined();
			expect(updatedState.batches.b2).toBeDefined();
            expect(finalizeItem).toHaveBeenCalledTimes(3);
            expect(updatedState.batchQueue.indexOf("b1")).toBe(-1);
            expect(updatedState.batchQueue.indexOf("b2")).toBe(0);
            expect(updatedState.batchesStartPending).toEqual(["b2"]);
		});

        it("should handle batch that no longer exists", () => {
            const queueState = getQueueState({
                items: {
                    "u1": { id: "u1", batchId: "b1" },
                },
                batches: {
                    "b2": {}
                },
                itemQueue: { "b1": ["u1"] },
            });

            getIsItemExists.mockReturnValueOnce(true);

            batchHelpers.cancelBatchForItem(queueState, "u1");

            expect(queueState.updateState).not.toHaveBeenCalled();
        });

        it("should handle item no longer exists", () => {
            const queueState = getQueueState({
                items: {
                    "u1": { id: "u1", batchId: "b1" },
                },
                batches: {
                    "b2": {}
                },
                itemQueue: { "b1": ["u1"] },
            });

            getIsItemExists.mockReturnValueOnce(false);

            batchHelpers.cancelBatchForItem(queueState, "u1");

            expect(queueState.updateState).not.toHaveBeenCalled();
        });

        it("should cancel batch for id", () => {
            const ids = ["u1", "u2", "u3"];
            const items = ids.reduce((res, id) =>
                ({ ...res, [id]: { id, batchId: "b1" } }), {});

            const cancelledBatch = {
                id: "b1",
                items: Object.values(items).map((i) => ({ ...i, changed: true }))
            };

            const queueState = getQueueState({
                items: {
                    ...items,
                    "u4": { id: "u4", batchId: "b2" },
                },
                batches: {
                    "b1": { batch: cancelledBatch, },
                    "b2": {}
                },
                itemQueue: { "b1": [...ids], "b2": ["u4"] },
                batchQueue: ["b1", "b2"],
                batchesStartPending: ["b1", "b2"],
            });

            getIsItemExists.mockReturnValueOnce(true);

            batchHelpers.cancelBatchWithId(queueState, "b1");

            const updatedState = queueState.getState();
            expect(updatedState.batches.b1).toBeUndefined();
            expect(updatedState.batchQueue.indexOf("b1")).toBe(-1);
        });
    });

	describe("getBatchFromItemId tests", () => {
		it("should return correct batch", () => {
			const batch = { id: "b2" };

			const queueState = getQueueState({
				items: {
					u1: { batchId: "b1" },
					u2: { batchId: "b2" },
				},
				batches: {
					b1: { batch: {} },
					b2: { batch, }
				}
			});

			const result = batchHelpers.getBatchFromItemId(queueState, "u2");

			expect(result).toStrictEqual(queueState.getState().batches.b2.batch);
		});
	});

	describe("getBatchDataFromItemId tests", () => {
		it("should return correct batch data", () => {
			const batch = { id: "b2" },
				batchOptions = {};

			const queueState = getQueueState({
				items: {
					u1: { batchId: "b1" },
					u2: { batchId: "b2" },
				},
				batches: {
					b1: { batch: {} },
					b2: { batch, batchOptions }
				}
			});

			const result = batchHelpers.getBatchDataFromItemId(queueState, "u2");

			expect(result.batch).toStrictEqual(queueState.getState().batches.b2.batch);
			expect(result.batchOptions).toStrictEqual(queueState.getState().batches.b2.batchOptions);
		});
	});

	describe("triggerUploaderBatchEvent tests", () => {
		it("should trigger with state items", () => {
			const batch = { id: "b1", items: [{ id: "u1" }, { id: "u2" }] };

			const queueState = getQueueState({
				batches: {
					b1: {batch, batchOptions: {}},
				},
				items: {
					u1: { test: 1 },
					u2: { test: 2 },
					u3: {},
				}
			});

			batchHelpers.triggerUploaderBatchEvent(queueState, "b1", UPLOADER_EVENTS.BATCH_FINISH);

			expect(queueState.trigger)
				.toHaveBeenCalledWith(UPLOADER_EVENTS.BATCH_FINISH, expect.objectContaining({
					...batch,
					items: [
						queueState.getState().items.u1,
						queueState.getState().items.u2,
					]
				}), {});
		});
	});

	describe("getBatchFromState", () => {
		it("should return batch", () => {
			const batch = {};
			const queueState = getQueueState({
				batches: {
					b1: {
						batch
					}
				}
			});

			expect(batchHelpers.getBatchFromState(queueState.getState(), "b1"));
		});
	});

    describe("detachRecycledFromPreviousBatch tests", () => {
        const getTestQueueState = () => {
            const items = {
                i1: { id: "i1", batchId: "b1" },
                i2: { id: "i2", batchId: "b1" },
                i3: { id: "i3", batchId: "b1" },
            };

            return getQueueState({
                items: {
                    ...items,
                    //item from different batch
                    i4: {id: "i4", batchId: "b3"},
                    //intentionally using batchId: b1 but not in batch.items
                    i5: {id: "i5", batchId: "b1"},
                },
                batches: {
                    b1: {
                        batch: {
                            id: "b1",
                            items: Object.values(items)
                        }
                    },
                    b3: {
                        batch: {
                            id: "b3",
                            items: [],
                        }
                    }
                }
            });
        };

        it("should detach from batch", () => {
            const qState = getTestQueueState();
            const item = { id: "i2", batchId: "b2", recycled: true, previousBatch: "b1" };

            batchHelpers.detachRecycledFromPreviousBatch(qState, item);

            const updatedBatch = batchHelpers.getBatchFromState(qState.getState(), "b1");
            expect(updatedBatch.items).toHaveLength(2);
            expect(updatedBatch.items.find(({id}) => id === item.id)).toBeUndefined();
        });

        it("should not detach for non-recycled", () => {
            const qState = getTestQueueState();
            const item = { id: "i2", batchId: "b2", previousBatch: "b1" };

            batchHelpers.detachRecycledFromPreviousBatch(qState, item);

            const updatedBatch = batchHelpers.getBatchFromState(qState.getState(), "b1");
            expect(updatedBatch.items).toHaveLength(3);
        });

        it("should not detach for mismatched previous batch", () => {
            const qState = getTestQueueState();
            const item = { id: "i2", batchId: "b2", previousBatch: "b4" };

            batchHelpers.detachRecycledFromPreviousBatch(qState, item);

            const updatedBatch = batchHelpers.getBatchFromState(qState.getState(), "b1");
            expect(updatedBatch.items).toHaveLength(3);
        });

        it("should not detach if item not in previous batch", () => {
            const qState = getTestQueueState();
            const item = { id: "i4", batchId: "b2", recycled: true, previousBatch: "b1" };

            batchHelpers.detachRecycledFromPreviousBatch(qState, item);

            const updatedBatch = batchHelpers.getBatchFromState(qState.getState(), "b1");
            expect(updatedBatch.items).toHaveLength(3);
        });

        it("should cope with item no longer in batch", () => {
            const qState = getTestQueueState();
            const item = { id: "i5", batchId: "b1", recycled: true, previousBatch: "b1" };

            batchHelpers.detachRecycledFromPreviousBatch(qState, item);

            const updatedBatch = batchHelpers.getBatchFromState(qState.getState(), "b1");
            expect(updatedBatch.items).toHaveLength(3);
        });

        it("should do nothing if batch no longer exists", () => {
            const qState = getTestQueueState();
            const item = { id: "i2", batchId: "b2", recycled: true, previousBatch: "???" };

            batchHelpers.detachRecycledFromPreviousBatch(qState, item);

            const updatedBatch = batchHelpers.getBatchFromState(qState.getState(), "b1");
            expect(updatedBatch.items).toHaveLength(3);
        });
    });

    describe("removePendingBatches tests", () => {
        it("should do nothing if no batches", () => {
            const queue = getQueueState({
                items: {
                },
                batches: {
                }
            });

            batchHelpers.removePendingBatches(queue);

            expect(Object.keys(queue.getState().batches)).toHaveLength(0);
        });

        it("should do nothing if no pending batches", () => {
            const items = [{ id: "i1" }, { id: "i2" }];

            const queue = getQueueState({
                items: {
                    i1: items[0],
                    i2: items[1],
                },
                batches: {
                    b1: {
                        batch: { state: BATCH_STATES.ADDED,  items, },
                    }
                }
            });

            batchHelpers.removePendingBatches(queue);

            expect(queue.getState().batches.b1).toBeDefined();
            expect(queue.getState().items.i1).toBeDefined();
            expect(queue.getState().items.i2).toBeDefined();
        });

        it("should remove pending batches", () => {
            const items = [{ id: "i1", batchId: "b1" },
                { id: "i2", batchId: "b1" },
                { id: "i3", batchId: "b2" },
                { id: "i4", batchId: "b3" },
            ];

            const queue = getQueueState({
                items: {
                    i1: items[0],
                    i2: items[1],
                    i3: items[2],
                    i4: items[3],
                },
                batches: {
                    b1: {
                        batch: { state: BATCH_STATES.PENDING, items: [items[0], items[1]], },
                    },
                    b2: {
                        batch: { state: BATCH_STATES.PENDING, items: [items[2]], },
                    },
                    b3: {
                        batch: { state: BATCH_STATES.ADDED, items: [items[3]], },
                    }
                },
                batchesStartPending: ["b1", "b2", "b3"],
            });

            batchHelpers.removePendingBatches(queue);

            expect(Object.keys(queue.getState().batches)).toHaveLength(1);
            expect(queue.getState().batches.b3).toBeDefined();
            expect(queue.getState().items.i4).toBeDefined();
            expect(queue.getState().batchesStartPending).toEqual(["b3"]);
            expect(finalizeItem).toHaveBeenCalledTimes(3);
        });
    });

    describe("preparePendingForUpload tests", () => {
        it("should do nothing if no pending batches", () => {
            const items = [{ id: "i1", state: FILE_STATES.ADDED }, { id: "i2" }];

            const queue = getQueueState({
                items: {
                    i1: items[0],
                    i2: items[1],
                },
                batches: {
                    b1: {
                        batch: { state: BATCH_STATES.ADDED, items, },
                    }
                }
            });

            batchHelpers.preparePendingForUpload(queue);

            expect(queue.getState().batches.b1.batch.state).toBe(BATCH_STATES.ADDED);
            expect(queue.getState().items.i1.state).toBe(FILE_STATES.ADDED);
        });

        const getPendingQueue = () => {
            const items = [
                { id: "i1", state: FILE_STATES.ADDED },
                { id: "i2", state: FILE_STATES.PENDING },
                { id: "i3", state: FILE_STATES.PENDING },
                ];

            return getQueueState({
                items: {
                    i1: items[0],
                    i2: items[1],
                    i3: items[2],
                },
                batches: {
                    b1: {
                        batch: { state: BATCH_STATES.ADDED, items: [items[0]], },
                    },
                    b2: {
                        batch: { state: BATCH_STATES.PENDING, items: [items[1], items[2]], },
                        batchOptions: { test: true }
                    }
                }
            });
        };

        it("should prepare pending for upload", () => {
            const queue = getPendingQueue();

            batchHelpers.preparePendingForUpload(queue);

            expect(queue.getState().batches.b2.batch.state).toBe(BATCH_STATES.ADDED);
            expect(queue.getState().batches.b2.batch.items[0].state).toBe(FILE_STATES.ADDED);
            expect(queue.getState().batches.b2.batch.items[1].state).toBe(FILE_STATES.ADDED);

            expect(queue.getState().batches.b2.batchOptions.test).toBe(true);
            expect(queue.getState().items.i2.state).toBe(FILE_STATES.ADDED);
            expect(queue.getState().items.i3.state).toBe(FILE_STATES.ADDED);
        });

        it("should prepare pending for upload with Options", () => {
            const queue = getPendingQueue();

            batchHelpers.preparePendingForUpload(queue, { test: false});

            expect(queue.getState().batches.b2.batch.state).toBe(BATCH_STATES.ADDED);
            expect(queue.getState().batches.b2.batchOptions.test).toBe(false);
            expect(queue.getState().items.i2.state).toBe(FILE_STATES.ADDED);
            expect(queue.getState().items.i3.state).toBe(FILE_STATES.ADDED);
        });
    });

    describe("incrementBatchFinishedCounter tests", () => {
        it("should increment finished counter for batch", () => {
            const queueState = getQueueState({
                batches: {
                    "b1": { finishedCounter: 1 }
                }
            });

            batchHelpers.incrementBatchFinishedCounter(queueState, "b1");
            expect(queueState.getState().batches["b1"].finishedCounter).toBe(2);
        });
    });

    describe("getIsBatchFinalized tests", () => {
        it.each([
            [BATCH_STATES.ABORTED, true],
            [BATCH_STATES.FINISHED, true],
            [BATCH_STATES.PROCESSING, false],
            [BATCH_STATES.ADDED, false],
            [BATCH_STATES.PENDING, false],
            [BATCH_STATES.CANCELLED, true],
            [BATCH_STATES.UPLOADING, false],
        ])
        ("for %s getIsBatchFinalized should return %s", (state, result) => {
            expect(batchHelpers.getIsBatchFinalized({ state })).toBe(result);
        });
    });

    describe("failBatchForItem tests", () => {
        it("should set batch as failed", () => {
            const ids = ["u1", "u2", "u3"];
            const items = ids.reduce((res, id) =>
                ({ ...res, [id]: { id, batchId: "b1" } }), {});

            const failedBatch = {
                id: "b1",
                items: Object.values(items).map((i) => ({ ...i, changed: true }))
            };

            const batchOptions = { userData: { test: "123" } };

            const queueState = getQueueState({
                items: {
                    ...items,
                    "u4": { id: "u4", batchId: "b2" },
                },
                batches: {
                    "b1": { batch: failedBatch, batchOptions },
                    "b2": {}
                },
                itemQueue: { "b1": [...ids], "b2": ["u4"] },
                batchQueue: ["b1", "b2"],
                batchesStartPending: ["b1"],
            });

            const eventBatch = queueState.getState().batches.b1.batch,
                eventItems = Object.values(queueState.getState().items).filter((i) => ~ids.indexOf(i.id));

            const message = "test error";

            batchHelpers.failBatchForItem(queueState, "u1", { message });

            expect(queueState.trigger).toHaveBeenCalledWith(
                UPLOADER_EVENTS.BATCH_ERROR,
                expect.objectContaining({
                    ...eventBatch,
                    state: BATCH_STATES.ERROR,
                    items: eventItems,
                    additionalInfo: message,
                }),
                batchOptions,
            );

            expect(queueState.trigger).toHaveBeenCalledWith(
                UPLOADER_EVENTS.BATCH_FINALIZE,
                expect.objectContaining({
                    ...eventBatch,
                    state: BATCH_STATES.ERROR,
                    items: eventItems,
                }),
                batchOptions
            );

            const updatedState = queueState.getState();
            expect(updatedState.batches.b1).toBeUndefined();
            expect(updatedState.batches.b2).toBeDefined();
            expect(updatedState.batchQueue.indexOf("b1")).toBe(-1);
            expect(updatedState.batchQueue.indexOf("b2")).toBe(0);
            expect(updatedState.batchesStartPending).toHaveLength(0);
            expect(finalizeItem).toHaveBeenCalledTimes(3);
            expect(finalizeItem).toHaveBeenCalledWith(expect.any(Object), "u3", true);
        });
    });

    describe("clearBatchData tests", () => {
        const batchId = "b1";

        it("should clear active batch data", () => {
            const batch = {
                items: [{ id: "i1" }, { id: "i2" }],
            };

            const queueState = getQueueState({
                batches: {
                    [batchId]: { batch },
                    "b2": {},
                },
                items: {
                    "i1": "aaa",
                    "i2": "bbb",
                    "i3": "ccc",
                },
                batchQueue: [batchId, "b2"],
                itemQueue: { [batchId]: [1, 2, 3], "b2": [5, 6] },
                activeIds: ["i1", "i4"],
                currentBatch: batchId,
            });

            batchHelpers.clearBatchData(queueState, "b1");

            const state = queueState.getState();

            expect(state.batches[batchId]).toBeUndefined();
            expect(state.batches["b2"]).toBeDefined();
            expect(state.batchQueue[0]).toBe("b2");
            expect(state.currentBatch).toBe(null);
            expect(state.items["i1"]).toBeUndefined();
            expect(state.items["i2"]).toBeUndefined();
            expect(state.items["i3"]).toBeDefined();
            expect(state.itemQueue[batchId]).toBeUndefined();
            expect(state.itemQueue["b2"]).toBeDefined();
            expect(state.activeIds[0]).toBe("i4");
        });

        it("should clear non-active batch data", () => {
            const batch = {
                items: [{ id: "i1" }, { id: "i2" }],
            };

            const queueState = getQueueState({
                batches: {
                    [batchId]: { batch },
                    "b2": {},
                },
                items: {
                    "i1": "aaa",
                    "i2": "bbb",
                    "i3": "ccc",
                },
                batchQueue: ["b2"],
                itemQueue: { [batchId]: [1, 2, 3], "b2": [5, 6] },
                activeIds: ["i1", "i4"],
                currentBatch: "b2",
            });

            batchHelpers.clearBatchData(queueState, "b1");

            const state = queueState.getState();

            expect(state.batches[batchId]).toBeUndefined();
            expect(state.batches["b2"]).toBeDefined();
            expect(state.batchQueue[0]).toBe("b2");
            expect(state.currentBatch).toBe("b2");
            expect(state.items["i1"]).toBeUndefined();
            expect(state.items["i2"]).toBeUndefined();
            expect(state.items["i3"]).toBeDefined();
            expect(state.itemQueue[batchId]).toBeUndefined();
            expect(state.itemQueue["b2"]).toBeDefined();
            expect(state.activeIds[0]).toBe("i4");
        });
    });

    describe("getIsBatchReady tests", () => {
        it.each([
            [BATCH_STATES.ABORTED, false],
            [BATCH_STATES.FINISHED, false],
            [BATCH_STATES.PROCESSING, true],
            [BATCH_STATES.ADDED, true],
            [BATCH_STATES.PENDING, false],
            [BATCH_STATES.CANCELLED, false],
            [BATCH_STATES.UPLOADING, true],
        ])
        ("for %s getIsBatchReady should return %s", (state, result) => {
            const batchId = "b1";

            const queueState = getQueueState({
                batches: { [batchId]: { batch: { state } } },
            });

            expect(batchHelpers.getIsBatchReady(queueState, batchId)).toBe(result);
        });
    });

    describe("isItemBatchStartPending tests", () => {
        it("should return true if batch start is pending", () => {
            const batch = {
                id: "b1",
                items: [{ id: "i1", batchId: "b1" }, { id: "i2", batchId: "b1" }],
            };

            const queueState = getQueueState({
                batches: {
                    b1: { batch },
                },
                items: {
                    "i1": batch.items[0],
                    "i2": batch.items[1],
                },
                batchesStartPending: [batch.id]
            });

            expect(batchHelpers.isItemBatchStartPending(queueState, "i2")).toBe(true);
        });

        it("should return false if batch start isnt pending", () => {
            const batch = {
                id: "b1",
                items: [{ id: "i1", batchId: "b1" }, { id: "i2", batchId: "b1" }],
            };

            const queueState = getQueueState({
                batches: {
                    b1: { batch },
                },
                items: {
                    "i1": batch.items[0],
                    "i2": batch.items[1],
                },
                batchesStartPending: ["b2"]
            });

            expect(batchHelpers.isItemBatchStartPending(queueState, "i2")).toBe(false);
        });
    });
});
