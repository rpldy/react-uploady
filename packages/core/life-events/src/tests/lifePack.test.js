import createLifePack from "../lifePack";

describe("lifePack tests", () => {
    it("should resolve creator with single param", () => {
        const creator = vi.fn(() => "value");
        const lp = createLifePack(creator);

        expect(creator).not.toHaveBeenCalled();
        expect(lp.resolve()).toEqual(["value"]);
    });

    it("should resolve creator with multiple params", () => {
        const creator = vi.fn(() => ["value", "value2"]);
        const lp = createLifePack(creator);

        expect(creator).not.toHaveBeenCalled();
        expect(lp.resolve()).toEqual(["value", "value2"]);
    });
});
