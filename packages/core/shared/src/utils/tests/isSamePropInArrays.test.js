import isSamePropInArrays from "../isSamePropInArrays";

describe("isSamePropInArrays tests", () => {

    it("should return true if same prop", () => {
        const result = isSamePropInArrays(
            [{ foo: "a" }, { foo: "b" }],
            [{ foo: "a" }, { foo: "b" }],
            "foo");

        expect(result).toBe(true);
    });

    it("should return true if same props", () => {

        const result = isSamePropInArrays(
            [{ foo: "a", bar: "1" }, { foo: "b", bar: "2", c: "test" }],
            [{ foo: "a", bar: "1" }, { foo: "b", bar: "2", c: "test2" }],
            ["foo", "bar"]);

        expect(result).toBe(true);
    });

    it("should return true if same props not just strings", () => {
        const result = isSamePropInArrays(
            [{ foo: "a", bar: false }, { foo: "b", bar: true, c: "test" }],
            [{ foo: "a", bar: false }, { foo: "b", bar: true, c: "test2" }],
            ["foo", "bar"]);

        expect(result).toBe(true);
    });

    it("should return true if same props even with diff refs", () => {
        const result = isSamePropInArrays(
            [{ foo: "a", bar: false }, {
                foo: "b", bar: () => {
                }, c: "test"
            }],
            [{ foo: "a", bar: false }, {
                foo: "b", bar: () => {
                }, c: "test2"
            }],
            ["foo", "bar"]);

        expect(result).toBe(true);
    });

    it("should return false if same props but different length", () => {
        const result = isSamePropInArrays(
            [{ foo: "a" }, { foo: "b" }],
            [{ foo: "a" }, { foo: "b" }, { foo: "c" }],
            "foo");

        expect(result).toBe(false);
    });

    it("should return true if same arrays", () => {
        const arr = [];
        expect(isSamePropInArrays(arr, arr, "test"))
            .toBe(true);
    });

    it("should return true for empty arrays ", () => {
        expect(isSamePropInArrays([], [], "test"))
            .toBe(true);
    });

    it("should return false if one is falsy", () => {

        expect(isSamePropInArrays([], null, "test"))
            .toBe(false);

        expect(isSamePropInArrays(undefined, null, "test"))
            .toBe(false);
    });

});
