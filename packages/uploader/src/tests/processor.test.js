import { UPLOADER_EVENTS } from "../consts";

const mockSender = jest.fn();

jest.doMock("../sender", () => mockSender);

import createProcessor, { initUploadQueue } from "../processor";

describe("processor tests", () => {

	const mockTrigger = jest.fn(),
		mockCancellable = jest.fn();

	beforeEach(() => {
		clearJestMocks(mockTrigger,
			mockCancellable);
	});

	describe("upload queue tests", () => {

		const getQueueTest = (state = {}, options = {}) => {

			state = {
				currentBatch: null,
				batches: {},
				items: {},
				activeIds: [],
				...state
			};

			options = {
				...options,
			};

			const queue = initUploadQueue(state, options, mockCancellable, mockTrigger);

			return {
				queue,
				state,
			};
		};

		it("should send file to upload successfully", () => {

		});

		it("should put file into pending queue in case no concurrent", () => {

		});

		it("should send file to upload if concurrent enabled ", () => {

		});

		it("should group files into single upload", () => {

		});


		describe("batch finished tests", () => {

			it("should finalize batch if no more uploads in queue", () => {

				const batch = {};

				const { queue, state } = getQueueTest({
					currentBatch: "b1",
					batches: {
						b1: { batch },
					}
				});

				queue.cleanUpFinishedBatch();

				expect(state.batches.b1).toBeUndefined();
				expect(mockTrigger).toHaveBeenCalledWith(UPLOADER_EVENTS.BATCH_FINISH, batch);
			});

			it("should finalize batch if next upload is from different batch", () => {

				const batch = {};

				const { queue, state } = getQueueTest({
					currentBatch: "b1",
					batches: {
						b1: { batch },
						b2: {
							batch: { id: "b2" },
						}
					},
					items: {
						"u2": { batchId: "b2" }
					}
				});

				queue.getItemQueue().push("u1", "u2");

				queue.cleanUpFinishedBatch();

				expect(state.batches.b1).toBeUndefined();
				expect(mockTrigger).toHaveBeenCalledWith(UPLOADER_EVENTS.BATCH_FINISH, batch);
			});

			it("shouldn't finalize batch if it has more uploads", () => {
				const batch = {id: "b1" };

				const { queue, state } = getQueueTest({
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
					}
				});

				queue.getItemQueue().push("u1", "u2", "u3");

				queue.cleanUpFinishedBatch();

				expect(state.batches.b1).toBeDefined();
				expect(mockTrigger).not.toHaveBeenCalledWith(UPLOADER_EVENTS.BATCH_FINISH, batch);
			});

		});

	});


});