import { UPLOADER_EVENTS } from "../../consts";
import getQueueState from "./mocks/getQueueState.mock";
import * as batchHelpers from "../batchHelpers";
import { BATCH_STATES } from "@rpldy/shared";

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
					"u2": { batchId: "b2" }
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
					"u2": { batchId: "b1" }
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

			const item1 = { id: "u1" },
				item2 = { id: "u2" };

			const batch = {
				id: "b1",
				items: [item1, item2]
			};

			const queueState = getQueueState({
				currentBatch: "b1",
				items: {
					"u1": item1,
					"u2": item2,
					"u3": {},
				},
				batches: {
					b1: { batch },
				},
			});

			const expectedBatch = expect.objectContaining({
				...queueState.getState().batches.b1.batch,
				items: [queueState.getState().items.u1, queueState.getState().items.u2],
			});

			batchHelpers.cleanUpFinishedBatch(queueState);

			const updatedState = queueState.getState();

			expect(queueState.updateState).toHaveBeenCalledTimes(2);
			expect(updatedState.batches.b1).toBeUndefined();
			expect(queueState.trigger).toHaveBeenCalledWith(UPLOADER_EVENTS.BATCH_FINISH, expectedBatch);
			expect(updatedState.items.u1).toBeUndefined();
			expect(updatedState.items.u2).toBeUndefined();
		});

		it("should finalize batch if next upload is from different batch", () => {

			const item1 = { id: "u1", batchId: "b1"  };

			const batch = {
				items: [item1]
			};

			const queueState = getQueueState({
				currentBatch: "b1",
				batches: {
					b1: { batch },
					b2: {
						batch: { id: "b2" },
					}
				},
				items: {
					"u1": item1,
					"u2": { batchId: "b2" }
				},
				itemQueue: ["u2"]
			});

			const expectedBatch = expect.objectContaining({
				...queueState.getState().batches.b1.batch,
				items: [queueState.getState().items.u1],
			});

			batchHelpers.cleanUpFinishedBatch(queueState);

			const updatedState = queueState.getState();

			expect(queueState.updateState).toHaveBeenCalledTimes(2);
			expect(updatedState.batches.b1).toBeUndefined();
			expect(queueState.trigger).toHaveBeenCalledWith(UPLOADER_EVENTS.BATCH_FINISH, expectedBatch);
			expect(updatedState.items.u1).toBeUndefined();
			expect(updatedState.items.u2).toBeDefined();
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
			expect(queueState.trigger).not.toHaveBeenCalled(); //dWith(UPLOADER_EVENTS.BATCH_FINISH, batch);
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
				}
			});

			queueState.cancellable.mockResolvedValueOnce(false);

			const allowed = await batchHelpers.loadNewBatchForItem(queueState, "u1");

			expect(allowed).toBe(true);

			expect(queueState.cancellable).toHaveBeenCalledWith(
				UPLOADER_EVENTS.BATCH_START, queueState.state.batches.b1.batch);

			expect(queueState.getState().currentBatch).toBe("b1");
		});

		it("should cancel batch", async () => {

			const queueState = getQueueState({
				currentBatch: "b1",
				batches: {
					"b2": { batch: { id: "b2" }, batchOptions: {} },
				},
				items: {
					"u2": { batchId: "b2" }
				}
			});

			queueState.cancellable.mockResolvedValueOnce(true);
			const allowed = await batchHelpers.loadNewBatchForItem(queueState, "u2");

			expect(allowed).toBe(false);

			expect(queueState.cancellable).toHaveBeenCalledWith(
				UPLOADER_EVENTS.BATCH_START, queueState.state.batches.b2.batch);

			expect(queueState.state.currentBatch).toBe("b1");
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

	describe("cancelBatchForItem tests", () => {
		it("should cancel batch, remove items and batch from state", () => {

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
				itemQueue: [...ids, "u4"],
			});

			const eventBatch = queueState.getState().batches.b1.batch,
				 eventItems = Object.values(queueState.getState().items).filter((i) => ~ids.indexOf(i.id));

			batchHelpers.cancelBatchForItem(queueState, "u1");

			expect(queueState.trigger).toHaveBeenCalledWith(
				UPLOADER_EVENTS.BATCH_CANCEL,
				expect.objectContaining({
					...eventBatch,
					state: BATCH_STATES.CANCELLED,
					items: eventItems,
				}),
			);

			const updatedState = queueState.getState();
			expect(updatedState.batches.b1).toBeUndefined();
			expect(updatedState.batches.b2).toBeDefined();

			expect(updatedState.itemQueue[0]).toEqual("u4");
			expect(updatedState.itemQueue).toHaveLength(1);

			expect(Object.keys(updatedState.items)).toEqual(["u4"]);
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

	describe("isItemBelongsToBatch tests", () => {
		it.each([
			["b2", true],
			["b1", false]
		])("for %s should return %s", (bId, expected) => {

			const queueState = getQueueState({
				items: {
					u1: { batchId: "b1" },
					u2: { batchId: "b2" },
				},
			});

			const result = batchHelpers.isItemBelongsToBatch(queueState, "u2", bId);

			expect(result).toBe(expected);
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
				}));
		});
	});

	describe("getIsItemBatchReady tests", () => {

		it.each([
				[BATCH_STATES.ADDED, true],
				[BATCH_STATES.PROCESSING, true],
				[BATCH_STATES.UPLOADING, true],
				[BATCH_STATES.FINISHED, false],
				[BATCH_STATES.CANCELLED, false],
			]
		)("for batch state: %s should return: %s", (state, result) => {
			const queueState = getQueueState({
				batches: {
					b1: {
						batch: {
							state
						}
					}
				},
				items: { "u1": { batchId: "b1" } }
			});

			expect(batchHelpers.getIsItemBatchReady(queueState, "u1")).toBe(result);
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
    });
});

