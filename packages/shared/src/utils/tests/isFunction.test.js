import isFunction from "../isFunction";

describe("isFunction tests", () => {

    it("should return true for function", () => {

        const fn1 = () => {
        };

        function fn2() {
        }

        expect(isFunction(fn1)).toBe(true);
        expect(isFunction(fn2)).toBe(true);
    });

    it("should return false for anything not a function", () => {

        expect(isFunction({})).toBe(false);
        expect(isFunction(null)).toBe(false);
        expect(isFunction(false)).toBe(false);
        expect(isFunction("a")).toBe(false);
        expect(isFunction(true)).toBe(false);
    });
});
