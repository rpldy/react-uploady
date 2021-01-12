import { triggerCancellable as mockTriggerCancellable } from "@rpldy/shared/src/tests/mocks/rpldy-shared.mock";
import mockCreateUploadQueue from "../queue";
import mockCreateItemsSender from "../batchItemsSender";
import createProcessor from "../processor";
import createBatch from "../batch";

jest.mock("../queue", () => jest.fn());
jest.mock("../batchItemsSender", () => jest.fn());
jest.mock("../batch");

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
        addBatch: jest.fn(),
        runCancellable: jest.fn(),
        clearPendingBatches: jest.fn(),
        uploadPendingBatches: jest.fn(),
	};

	beforeEach(() => {
		clearJestMocks(
			mockCreateUploadQueue,
			mockCreateItemsSender,
			mockTriggerCancellable,
			queue,
		);
	});

	const testProcessor = () => {

		mockTriggerCancellable.mockReturnValueOnce(cancellable);
		mockCreateItemsSender.mockReturnValueOnce(sender);
		mockCreateUploadQueue.mockReturnValueOnce(queue);

		return createProcessor(trigger, cancellable, options, uploaderId);
	};

	it("should create processor", () => {
		const processor = testProcessor();

		expect(mockCreateItemsSender).toHaveBeenCalled();
        expect(mockCreateUploadQueue).toHaveBeenCalledWith(options, trigger, cancellable, sender, uploaderId);

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

    it("should create batch on addNewBatch", () => {
        const processor = testProcessor();
        const files = [1,2];
        const options = { test: true };

        createBatch.mockReturnValueOnce("batch");

        processor.addNewBatch(files, "u1", options);

        expect(createBatch).toHaveBeenCalledWith(files, "u1", options);
        expect(queue.addBatch).toHaveBeenCalledWith("batch", options);
    });

    it("should use queue runCancellable", () => {
        const processor = testProcessor();

        processor.runCancellable();
        expect(queue.runCancellable).toHaveBeenCalled();
    });

    it("clearPendingBatches should use queue clearPendingBatches", () => {
        const processor = testProcessor();
        processor.clearPendingBatches();
        expect(queue.clearPendingBatches).toHaveBeenCalled();
    });

    it("processPendingBatches should use queue uploadPendingBatches", () => {
        const processor = testProcessor();
        processor.processPendingBatches();
        expect(queue.uploadPendingBatches).toHaveBeenCalled();
    });

});
