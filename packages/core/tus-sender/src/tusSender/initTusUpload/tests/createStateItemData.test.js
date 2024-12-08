import createStateItemData from "../createStateItemData";

describe("createStateItemData tests", () => {
    it("should create state item data", () => {
        const item = { id: "item1", file: { size: 1234 } };
        const tusState = { updateState: vi.fn() };
        const options = {};
        const parallelIdentifier = "parallel1";
        const orgItemId = "org1";

        createStateItemData(item, tusState, options, parallelIdentifier, orgItemId);

        expect(tusState.updateState).toHaveBeenCalledWith(expect.any(Function));
        const stateUpdater = tusState.updateState.mock.calls[0][0];
        const state = { items: {} };
        stateUpdater(state);
        expect(state.items[item.id]).toEqual({
            id: item.id,
            uploadUrl: null,
            size: item.file.size,
            offset: 0,
            parallelIdentifier,
            orgItemId,
        });
    });

    it("should handle missing parallelIdentifier and orgItemId", () => {
        const item = { id: "item2", file: { size: 5678 } };
        const tusState = { updateState: vi.fn() };
        const options = {};

        createStateItemData(item, tusState, options, null, null);

        expect(tusState.updateState).toHaveBeenCalledWith(expect.any(Function));
        const stateUpdater = tusState.updateState.mock.calls[0][0];
        const state = { items: {} };
        stateUpdater(state);
        expect(state.items[item.id]).toEqual({
            id: item.id,
            uploadUrl: null,
            size: item.file.size,
            offset: 0,
            parallelIdentifier: null,
            orgItemId: null,
        });
    });

    it("should handle empty options", () => {
        const item = { id: "item3", file: { size: 91011 } };
        const tusState = { updateState: vi.fn() };
        const options = {};

        createStateItemData(item, tusState, options, "parallel2", "org2");

        expect(tusState.updateState).toHaveBeenCalledWith(expect.any(Function));
        const stateUpdater = tusState.updateState.mock.calls[0][0];
        const state = { items: {} };
        stateUpdater(state);
        expect(state.items[item.id]).toEqual({
            id: item.id,
            uploadUrl: null,
            size: item.file.size,
            offset: 0,
            parallelIdentifier: "parallel2",
            orgItemId: "org2",
        });
    });
});
