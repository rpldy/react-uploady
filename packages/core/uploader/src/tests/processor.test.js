import { triggerCancellable as mockTriggerCancellable } from "@rpldy/shared/src/tests/mocks/rpldy-shared.mock";
import mockCreateUploadQueue from "../queue";
import mockCreateItemsSender from "../batchItemsSender";
import mockCreateBatch from "../batch";
import createProcessor from "../processor";

vi.mock("../queue");
vi.mock("../batchItemsSender");
vi.mock("../batch");

describe("processor tests", () => {
	const trigger = () => {
	};
	const options = {};
	const uploaderId = "111";
	const cancellable = {};
	const sender = {};
	const queue = {
		uploadBatch: vi.fn(),
		abortAll: vi.fn(),
		abortItem: vi.fn(),
		abortBatch: vi.fn(),
        addBatch: vi.fn(),
        runCancellable: vi.fn(),
        clearPendingBatches: vi.fn(),
        uploadPendingBatches: vi.fn(),
        cancelBatch: vi.fn(),
	};

	beforeEach(() => {
		clearViMocks(
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

		processor.clearPendingBatches();
		expect(queue.clearPendingBatches).toHaveBeenCalled();
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

    describe("addNewBatch tests", () => {
       it("should not add anything in case batch returns empty", async () => {
           const processor = testProcessor();
           const files = [1, 2];
           const options = { autoUpload: false };
           const queueBatch = { items: [] };
           mockCreateBatch.mockResolvedValueOnce(queueBatch);

           const batch = await processor.addNewBatch(files, options);

           expect(batch).toBeNull();
           expect(queue.addBatch).not.toHaveBeenCalled();
           expect(mockCreateBatch).toHaveBeenCalledWith(files, uploaderId, options);
        });

        it("should auto upload", async () => {
            const processor = testProcessor();
            const files = [1, 2];
            const options = { autoUpload: true };
            const queueBatch = { items: [1, 2,], };

            mockCreateBatch.mockResolvedValueOnce(queueBatch);
            queue.addBatch.mockReturnValueOnce(queueBatch);
            queue.runCancellable.mockResolvedValueOnce(false);
            const batch = await processor.addNewBatch(files, options);

            expect(queue.addBatch).toHaveBeenCalledWith(queueBatch, options);
            expect(queue.uploadBatch).toHaveBeenCalledWith(queueBatch);
            expect(batch).toBe(queueBatch);
        });

        it("should add batch but not upload with autoUpload = false", async () => {
            const processor = testProcessor();
            const files = [1, 2];
            const options = { autoUpload: false };
            const queueBatch = { items: [1, 2,], };

            mockCreateBatch.mockResolvedValueOnce(queueBatch);
            queue.addBatch.mockReturnValueOnce(queueBatch);
            queue.runCancellable.mockResolvedValueOnce(false);
            const batch = await processor.addNewBatch(files, options);

            expect(queue.addBatch).toHaveBeenCalledWith(queueBatch, options);
            expect(queue.uploadBatch).not.toHaveBeenCalledWith(queueBatch);
            expect(batch).toBe(queueBatch);
        });

        it("should set batch as cancelled if add is cancelled", async () => {
            const processor = testProcessor();
            const files = [1, 2];
            const options = { autoUpload: true };
            const queueBatch = { items: [1, 2,], };

            mockCreateBatch.mockResolvedValueOnce(queueBatch);
            queue.addBatch.mockReturnValueOnce(queueBatch);
            queue.runCancellable.mockResolvedValueOnce(true);
            const batch = await processor.addNewBatch(files, options);

            expect(queue.addBatch).toHaveBeenCalledWith(queueBatch, options);
            expect(queue.cancelBatch).toHaveBeenCalledWith(queueBatch);
            expect(queue.uploadBatch).not.toHaveBeenCalledWith(queueBatch);
            expect(batch).toBe(queueBatch);
        });
    });
});
