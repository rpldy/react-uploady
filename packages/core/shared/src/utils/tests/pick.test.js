import pick from "../pick";

describe("pick tests", () => {

    it("should return null for null", () => {
        expect(pick(null)).toBeNull();
    });

    it("should return empty obj for no props", () => {
        expect(pick({ test: true }, [])).toEqual({});
    });

    it("should return requested props", () => {

        expect(pick({
            foo: "aaa",
            bar: "bbb",
            test: true,
            more: { level: 2 }
        }, ["foo", "more"])).toEqual({
            foo: "aaa",
            more: { level: 2 }
        });
    });
});
