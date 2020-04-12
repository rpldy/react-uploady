jest.mock("../batchHelpers", () => ({
	triggerUploaderBatchEvent: jest.fn(),
	getBatchFromState: jest.fn(),
}));
import getQueueState from "./mocks/getQueueState.mock";
import { BATCH_STATES, FILE_STATES } from "@rpldy/shared";
import * as abortMethods from "../abort";
import { UPLOADER_EVENTS } from "../../consts";
import { triggerUploaderBatchEvent, getBatchFromState } from "../batchHelpers";

describe("abort tests", () => {
	const mockItemAbort = jest.fn(() => true);

	beforeEach(() => {
		clearJestMocks(mockItemAbort);
	});

	describe("abortItem tests", () => {

		it("should xhr abort uploading item ", () => {
			const queue = getQueueState({
				items: {
					"u1": {
						state: FILE_STATES.UPLOADING
					}
				},
				aborts: {
					"u1": mockItemAbort
				}
			});

			const result = abortMethods.abortItem(queue, "u1");

			expect(result).toBe(true);
			expect(mockItemAbort).toHaveBeenCalled();
			expect(queue.getState().items.u1.state).toBe(FILE_STATES.ABORTED);
			expect(queue.getState().aborts.u1).toBeUndefined();
		});

		it("should call abort for added item", () => {
			const queue = getQueueState({
				items: {
					"u1": {
						state: FILE_STATES.ADDED
					}
				},
				aborts: {
					"u1": mockItemAbort
				}
			});

			const result = abortMethods.abortItem(queue, "u1");

			expect(result).toBe(true);
			expect(mockItemAbort).not.toHaveBeenCalled();
			expect(queue.getState().items.u1.state).toBe(FILE_STATES.ABORTED);
			expect(queue.getState().aborts.u1).toBeUndefined();
		});

		it.each([
			[FILE_STATES.FINISHED],
			[FILE_STATES.ABORTED],
			[FILE_STATES.CANCELLED],
			[FILE_STATES.ERROR]
		])("should not call abort for item not in progress - %s", (fileState) => {
			const queue = getQueueState({
				items: {
					"u1": { state: fileState },
				}
			});

			const result = abortMethods.abortItem(queue, "u1");
			expect(result).toBe(false);
			expect(queue.getState().items.u1.state).toBe(fileState);
		});
	});

	it("should abort all", () => {

		const queue = getQueueState({
			items: {
				"u1": {
					state: FILE_STATES.UPLOADING,
				},
				"u2": {
					state: FILE_STATES.UPLOADING,
				},
				"u3": {
					state: FILE_STATES.ADDED,
				},
				"u4": {
					state: FILE_STATES.FINISHED,
				},
			},
			aborts: {
				"u1": mockItemAbort,
				"u2": mockItemAbort,
				"u3": mockItemAbort,
				"u4": mockItemAbort,
			}
		});

		abortMethods.abortAll(queue);

		expect(mockItemAbort).toHaveBeenCalledTimes(2);
		expect(queue.getState().items.u1.state).toBe(FILE_STATES.ABORTED);
		expect(queue.getState().items.u2.state).toBe(FILE_STATES.ABORTED);
		expect(queue.getState().items.u3.state).toBe(FILE_STATES.ABORTED);
		expect(queue.getState().items.u4.state).toBe(FILE_STATES.FINISHED);
		expect(queue.getState().aborts.u1).toBeUndefined();
		expect(queue.getState().aborts.u2).toBeUndefined();
		expect(queue.getState().aborts.u3).toBeUndefined();
	});

	describe("batch abort tests", () => {

		const getBatch = (state) => ({
			state,
			items: [
				{ id: "u1", state: FILE_STATES.ADDED },
				{ id: "u2", state: FILE_STATES.UPLOADING },
				{ id: "u3", state: FILE_STATES.CANCELLED }
			],
		});

		it("should abort batch", () => {
			const batch = getBatch(BATCH_STATES.ADDED);

			getBatchFromState.mockReturnValueOnce(batch);

			const queue = getQueueState({
				batches: {
					"b1": {
						batch
					}
				},
				items: {
					"u1": batch.items[0],
					"u2": batch.items[1],
					"u3": batch.items[2],
				},
				aborts: {
					"u1": mockItemAbort,
					"u2": mockItemAbort,
					"u3": mockItemAbort,
				}
			});

			abortMethods.abortBatch(queue, "b1");

			expect(triggerUploaderBatchEvent).toHaveBeenCalledWith(queue, "b1", UPLOADER_EVENTS.BATCH_ABORT);
			expect(mockItemAbort).toHaveBeenCalledTimes(1);
			expect(queue.getState().batches.b1.batch.state).toBe(BATCH_STATES.ABORTED);
			expect(queue.getState().items.u1.state).toBe(FILE_STATES.ABORTED);
			expect(queue.getState().items.u2.state).toBe(FILE_STATES.ABORTED);
			expect(queue.getState().items.u3.state).toBe(FILE_STATES.CANCELLED);
			expect(queue.getState().aborts.u1).toBeUndefined();
			expect(queue.getState().aborts.u2).toBeUndefined();
		});

		it("shouldnt abort if already finished or cancelled", () => {
			const batch = getBatch(BATCH_STATES.FINISHED);

			const queue = getQueueState({
				batches: {
					"b1": {
						batch
					}
				}
			});

			abortMethods.abortBatch(queue, "b1");

			expect(queue.trigger).not.toHaveBeenCalled();
			expect(mockItemAbort).not.toHaveBeenCalled();
		});
	});
});