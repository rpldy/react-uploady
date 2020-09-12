jest.mock("../queue", () => jest.fn());
jest.mock("../batchItemsSender", () => jest.fn());
import { triggerCancellable as mockTriggerCancellable } from "@rpldy/shared/src/tests/mocks/rpldy-shared.mock";

import mockCreateUploadQueue from "../queue";
import mockCreateItemsSender from "../batchItemsSender";
import createProcessor from "../processor";

describe("processor tests", () => {

	const trigger = () => {
	};
	const options = {};
	const uploaderId = "111";
	const cancellable = {};
	const sender = {};
	const queue = {
		uploadBatch: jest.fn(),
		abortAll: jest.fn(),
		abortItem: jest.fn(),
		abortBatch: jest.fn(),
	};

	beforeEach(() => {
		clearJestMocks(
			mockCreateUploadQueue,
			mockCreateItemsSender,
			mockTriggerCancellable,
			...Object.values(queue)
		);
	});

	const testProcessor = () => {

		mockTriggerCancellable.mockReturnValueOnce(cancellable);
		mockCreateItemsSender.mockReturnValueOnce(sender);
		mockCreateUploadQueue.mockReturnValueOnce(queue);

		return createProcessor(trigger, options, uploaderId);
	};

	it("should create processor", () => {
		const processor = testProcessor();

		expect(mockTriggerCancellable).toHaveBeenCalledWith(trigger);
		expect(mockCreateItemsSender).toHaveBeenCalled();
		expect(mockCreateUploadQueue).toHaveBeenCalledWith(options, cancellable, trigger, sender, uploaderId);

		const batch = {}, batchOptions = {};
		processor.process(batch, batchOptions);
		expect(queue.uploadBatch).toHaveBeenCalledWith(batch, batchOptions);
	});

	it("should call abort methods on queue", () => {

		const processor = testProcessor();

		processor.abort();
		expect(queue.abortAll).toHaveBeenCalled();
		processor.abort("u1");
		expect(queue.abortItem).toHaveBeenCalledWith("u1");
		processor.abortBatch("b1");
		expect(queue.abortBatch).toHaveBeenCalledWith("b1");
	});

});