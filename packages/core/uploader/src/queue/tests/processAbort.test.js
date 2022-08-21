import getQueueState from "./mocks/getQueueState.mock";
import { BATCH_STATES } from "@rpldy/shared";
import { UPLOADER_EVENTS } from "../../consts";
import { processAbortAll, processAbortBatch, processAbortItem } from "../processAbort";
import processFinishedRequest from "../processFinishedRequest";
import processQueueNext from "../processQueueNext";
import { getIsBatchFinalized, finalizeBatch } from "../batchHelpers";

jest.mock("../processFinishedRequest");
jest.mock("../processQueueNext");
jest.mock("../batchHelpers");

describe("processAbort tests", () => {
    afterEach(() => {
        clearJestMocks(
            processFinishedRequest,
            processQueueNext,
            getIsBatchFinalized,
            finalizeBatch,
        );
    });

    describe("processAbortAll tests", () => {
        it("should throw if no abortAll options method provided", () => {
            const queueState = getQueueState();

            expect(() => {
                processAbortAll(queueState);
            }).toThrow("Abort All method not provided yet abortAll was called");
        });

        it("should handle abort all - not fast", () => {
            const abortAll = jest.fn(() => ({}));

            const queueState = getQueueState({}, { abortAll });

            processAbortAll(queueState);

            expect(queueState.trigger).toHaveBeenCalledWith(UPLOADER_EVENTS.ALL_ABORT);
            expect(queueState.clearAllUploads).not.toHaveBeenCalled();

            abortAll.mock.calls[0][2](1, "data");

            expect(processFinishedRequest).toHaveBeenCalledWith(queueState, [{
                id: 1,
                info: "data"
            }], processQueueNext);
        });

        it("should handle abort all - fast", () => {
            const abortAll = jest.fn(() => ({ isFast: true }));

            const queueState = getQueueState({}, { abortAll });

            processAbortAll(queueState);

            expect(queueState.trigger).toHaveBeenCalledWith(UPLOADER_EVENTS.ALL_ABORT);
            expect(queueState.clearAllUploads).toHaveBeenCalled();
        });
    });

    describe("processAbortBatch tests", () => {
        it("should throw if no abortAll options method provided", () => {
            const queueState = getQueueState();

            expect(() => {
                processAbortBatch(queueState);
            }).toThrow("Abort Batch method not provided yet abortItem was called");
        });

        it("should handle abort batch - not fast", () => {
            const abortBatch = jest.fn(() => ({}));

            const batch = { id: "b1" },
                batchOptions = { autoUpload: false };

            const queueState = getQueueState({
                batches: {
                    "b1": {
                        batch,
                        batchOptions,
                    }
                },
                aborts: {}
            }, { abortBatch });

            processAbortBatch(queueState, batch.id);

            expect(finalizeBatch).toHaveBeenCalledWith(queueState, batch.id, UPLOADER_EVENTS.BATCH_ABORT, BATCH_STATES.ABORTED);

            expect(abortBatch).toHaveBeenCalledWith(
                expect.objectContaining(batch),
                expect.objectContaining(batchOptions),
                expect.any(Object),
                expect.any(Function),
                { abortBatch }
            );

            abortBatch.mock.calls[0][3](1, "data");

            expect(processFinishedRequest).toHaveBeenCalledWith(queueState, [{
                id: 1,
                info: "data"
            }], processQueueNext);
        });

        it("should handle abort batch - fast", () => {
            const abortBatch = jest.fn(() => ({ isFast: true }));

            const batch = { id: "b1" },
                batchOptions = { autoUpload: false };

            const queueState = getQueueState({
                batches: {
                    "b1": {
                        batch,
                        batchOptions,
                    }
                },
                aborts: {}
            }, { abortBatch });

            processAbortBatch(queueState, batch.id);

            expect(finalizeBatch).toHaveBeenCalledWith(queueState, batch.id, UPLOADER_EVENTS.BATCH_ABORT, BATCH_STATES.ABORTED);
            expect(queueState.clearBatchUploads).toHaveBeenCalledWith(batch.id);
        });

        it("should skip batch abort if finalized already", () => {
            const abortBatch = jest.fn(() => ({ }));

            const batch = { id: "b1" },
                batchOptions = { autoUpload: false };

            const queueState = getQueueState({
                batches: {
                    "b1": {
                        batch,
                        batchOptions,
                    }
                },
                aborts: {}
            }, { abortBatch });

            getIsBatchFinalized.mockReturnValueOnce(true);

            processAbortBatch(queueState, batch.id);

            expect(finalizeBatch).not.toHaveBeenCalled();
            expect(abortBatch).not.toHaveBeenCalled();
        });
    });

    describe("processAbortItem tests", () => {
        it("should throw if no abortItem options method provided", () => {
            const queueState = getQueueState();

            expect(() => {
                processAbortItem(queueState);
            }).toThrow("Abort Item method not provided yet abortItem was called");
        });

        it("should abort item", () => {
            const abortItem = jest.fn(() => true);

            const queueState = getQueueState({}, { abortItem });

            const result = processAbortItem(queueState, "i1");

            expect(result).toBe(true);

            abortItem.mock.calls[0][3](1, "data");

            expect(processFinishedRequest).toHaveBeenCalledWith(queueState, [{
                id: 1,
                info: "data"
            }], processQueueNext);
        });
    });
});
