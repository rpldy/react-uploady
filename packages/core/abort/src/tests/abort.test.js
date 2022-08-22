import { FILE_STATES } from "@rpldy/shared";
import { abortItem, abortBatch, abortAll } from "../abort";
import { fastAbortAll, fastAbortBatch } from "../fastAbort";

jest.mock("../fastAbort");

describe("abort tests", () => {
    const finalizeMock = jest.fn();

    afterEach(() => {
        finalizeMock.mockReset();
        fastAbortBatch.mockReset();
        fastAbortAll.mockReset();
    });

    describe("abort item tests", () => {
        const itemId = "i1";

        it.each([
            [FILE_STATES.FINISHED],
            [FILE_STATES.ABORTED],
            [FILE_STATES.CANCELLED],
            [FILE_STATES.ERROR]
        ])("should not call abort for item not in progress - %s", (fileState) => {
            const abort = jest.fn();

            const result = abortItem(itemId, { [itemId]: { state: fileState } }, { [itemId]: abort }, finalizeMock);

            expect(result).toBe(false);
            expect(finalizeMock).not.toHaveBeenCalled();
            expect(abort).not.toHaveBeenCalled();
        });

        it.each([
            [FILE_STATES.ADDED],
            [FILE_STATES.PENDING],
        ])("should finalize pending item", (fileState) => {
            const abort = jest.fn();

            const result = abortItem(itemId, {
                [itemId]: {
                    id: itemId,
                    state: fileState
                }
            }, { [itemId]: abort }, finalizeMock);

            expect(result).toBe(true);
            expect(abort).not.toHaveBeenCalled();
            expect(finalizeMock).toHaveBeenCalledWith(itemId,
                { status: 0, state: FILE_STATES.ABORTED, response: "aborted" });
        });

        it("should abort item in progress", () => {
            const abort = jest.fn(() => true);
            const result = abortItem(itemId, {
                [itemId]: {
                    id: itemId,
                    state: FILE_STATES.UPLOADING
                }
            }, { [itemId]: abort }, finalizeMock);

            expect(result).toBe(true);
            expect(abort).toHaveBeenCalled();
            expect(finalizeMock).not.toHaveBeenCalled();
        });

        it("should do nothing for non-existing item", () => {
            const result = abortItem(itemId, {}, {}, finalizeMock);

            expect(result).toBe(false);
            expect(finalizeMock).not.toHaveBeenCalled();
        });
    });

    describe("batch abort tests", () => {
        const getBatch = (items = null) => ({
            id: "b1",
            items: items || [
                { id: "i1", state: FILE_STATES.ADDED },
                { id: "i2", state: FILE_STATES.UPLOADING },
                { id: "i3", state: FILE_STATES.CANCELLED },
                { id: "i4", state: FILE_STATES.FINISHED }
            ],
        });

        it("should abort items in batch", () => {
            const batch = getBatch();
            const abort = jest.fn();

            abortBatch(batch, {}, { "i2": abort }, { "b1": ["i1", "i2", "i3"] }, finalizeMock, { fastAbortThreshold: 4 });

            expect(finalizeMock).toHaveBeenCalledTimes(1);
            expect(abort).toHaveBeenCalledTimes(1);
        });

        it("fast abort - should prefer batch options threshold over options", () => {
            const batch = getBatch([
                { id: "i1" },
                { id: "i2" },
                { id: "i3" },
            ]);
            const abort = jest.fn();

            const { isFast } = abortBatch(batch, { fastAbortThreshold: 3 }, {
                "i1": abort,
                "i2": abort
            },
                { "b1": ["i1", "i2", "i3"] },
                finalizeMock, { fastAbortThreshold: 100 });

            expect(isFast).toBe(true);
            expect(finalizeMock).not.toHaveBeenCalled();
            expect(fastAbortBatch).toHaveBeenCalled();
        });

        it("fast abort - should use 0 threshold from batch options", () => {
            const batch = getBatch();
            const abort = jest.fn();

            const { isFast } = abortBatch(batch, { fastAbortThreshold: 0 }, {
                "i1": abort,
                "i2": abort
            },
                { "b1": ["i1", "i2", "i3"] },
                finalizeMock, { fastAbortThreshold: 1 });

            expect(isFast).toBe(false);
            expect(finalizeMock).toHaveBeenCalledTimes(1);
            expect(abort).toHaveBeenCalledTimes(1);
        });

        it("fast abort - should ignore 0 threshold from options", () => {
            const batch = getBatch();
            const abort = jest.fn();

            const { isFast } = abortBatch(batch, {}, {
                "i1": abort,
                "i2": abort
            },  { "b1": ["i1", "i2", "i3"] }, finalizeMock, { fastAbortThreshold: 0 });

            expect(isFast).toBe(false);
            expect(finalizeMock).toHaveBeenCalledTimes(1);
            expect(abort).toHaveBeenCalledTimes(1);
        });
    });

    describe("all abort tests", () => {
        it("should abort all items", () => {
            const abort = jest.fn();

            const { isFast } = abortAll({
                "u1": {
                    id: "u1",
                    batchId: "b1",
                    state: FILE_STATES.UPLOADING,
                },
                "u2": {
                    id: "u2",
                    batchId: "b1",
                    state: FILE_STATES.UPLOADING,
                },
                "u3": {
                    id: "u3",
                    batchId: "b1",
                    state: FILE_STATES.ADDED,
                },
                "u4": {
                    id: "u4",
                    batchId: "b1",
                    state: FILE_STATES.FINISHED,
                },
                "u7": {
                        id: "u7",
                        batchId: "b2",
                        state: FILE_STATES.FINISHED,
                    },
            },
                { "u1": abort, "u2": abort, "u5": abort },
                {"b1": ["u1", "u2", "u3"], "b2": ["u4"] },
                finalizeMock,
                { fastAbortThreshold: 5 }
            );

            expect(isFast).toBe(false);
            expect(abort).toHaveBeenCalledTimes(2);
            expect(finalizeMock).toHaveBeenCalledTimes(1);
        });

        it("should use fast abort for all", () => {
            const abort = jest.fn();

            const { isFast } = abortAll({
                "u1": {
                    id: "u1",
                    batchId: "b1",
                    state: FILE_STATES.UPLOADING,
                },
                "u2": {
                    id: "u2",
                    batchId: "b1",
                    state: FILE_STATES.UPLOADING,
                },
                "u3": {
                    id: "u3",
                    batchId: "b1",
                    state: FILE_STATES.ADDED,
                },
                "u4": {
                    id: "u4",
                    batchId: "b2",
                    state: FILE_STATES.FINISHED,
                },
            },
                { "u1": abort, "u2": abort },
                {"b1": ["u1", "u2", "u3"], "b2": ["u4"] },
                finalizeMock, { fastAbortThreshold: 4 });

            expect(isFast).toBe(true);
            expect(fastAbortAll).toHaveBeenCalled();
            expect(finalizeMock).not.toHaveBeenCalled();
        });
    });
});
