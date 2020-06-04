import getQueueState from "./mocks/getQueueState.mock";
import { BATCH_STATES, FILE_STATES } from "@rpldy/shared";
import { UPLOADER_EVENTS } from "../../consts";
import { triggerUploaderBatchEvent, getBatchFromState } from "../batchHelpers";
import processFinishedRequest from "../processFinishedRequest";
import * as abortMethods from "../abort";

jest.mock("../batchHelpers", () => ({
	triggerUploaderBatchEvent: jest.fn(),
	getBatchFromState: jest.fn(),
}));

jest.mock("../processFinishedRequest", () => jest.fn());

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

			const next = "next";

			const result = abortMethods.abortItem(queue, "u1", next);

			expect(result).toBe(true);
			expect(mockItemAbort).not.toHaveBeenCalled();
			expect(queue.getState().items.u1.state).toBe(FILE_STATES.ADDED);

			expect(processFinishedRequest).toHaveBeenCalledWith(queue,
				[{
					id: "u1",
					info: { status: 0, state: FILE_STATES.ABORTED, response: "aborted" },
				}], next);
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

		const next = "next";

		abortMethods.abortAll(queue, next);

		expect(mockItemAbort).toHaveBeenCalledTimes(2);
		expect(queue.getState().items.u1.state).toBe(FILE_STATES.ABORTED);
		expect(queue.getState().items.u2.state).toBe(FILE_STATES.ABORTED);
		expect(queue.getState().items.u3.state).toBe(FILE_STATES.ADDED);
		expect(queue.getState().items.u4.state).toBe(FILE_STATES.FINISHED);

		expect(processFinishedRequest).toHaveBeenCalledWith(queue,
			[{
				id: "u3",
				info: { status: 0, state: FILE_STATES.ABORTED, response: "aborted" },
			}], next);
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

			const next = "next";

			abortMethods.abortBatch(queue, "b1", next);

			expect(triggerUploaderBatchEvent).toHaveBeenCalledWith(queue, "b1", UPLOADER_EVENTS.BATCH_ABORT);
			expect(mockItemAbort).toHaveBeenCalledTimes(1);
			expect(queue.getState().batches.b1.batch.state).toBe(BATCH_STATES.ABORTED);
			expect(queue.getState().items.u1.state).toBe(FILE_STATES.ADDED);
			expect(queue.getState().items.u2.state).toBe(FILE_STATES.ABORTED);
			expect(queue.getState().items.u3.state).toBe(FILE_STATES.CANCELLED);

			expect(processFinishedRequest).toHaveBeenCalledWith(queue,
				[{
					id: "u1",
					info: { status: 0, state: FILE_STATES.ABORTED, response: "aborted" },
				}], next);
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