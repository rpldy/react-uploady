import { fastAbortBatch, fastAbortAll } from "../fastAbort";

describe("fast abort tests", () => {
    it("should fast abort batch items", () => {
        const abort = jest.fn();

        fastAbortBatch({ items: [{ id: "u1" }, { id: "u2" }, { id: "u3" }] }, { "u1": abort, "u2": abort, "u4": abort });

        expect(abort).toHaveBeenCalledTimes(2);
    });

    it("should fast abort all", () => {
        const abort = jest.fn();

        fastAbortAll({ "u1": abort, "u2": abort });

        expect(abort).toHaveBeenCalledTimes(2);
    });
});
