import getChunkedState from "../getChunkedState";

jest.mock("@rpldy/simple-state", () => (state) => ({
    state,
    update: (updater) => updater(state),
}));

describe("getChunkedState tests", () => {
    it("should return chunked state", () => {
        const chunkedState = getChunkedState([{}, {}], "test.com", { method: "PUT", startByte: 3 }, { chunked: true });

        const state = chunkedState.getState();

        expect(state.chunks).toHaveLength(2);
        expect(state.url).toBe("test.com");

        let updateCnt = 0;

        chunkedState.updateState((state) => {
            updateCnt++;
            expect(state.startByte).toBe(3);
        });

        expect(updateCnt).toBe(1);
    });
});
