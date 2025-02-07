import isPlainObject from "../isPlainObject";

describe("isPlainObject tests", () => {
    it.each([
        [false, JSON.parse(`{"__proto__":{"pollutedKey":123}}`)],
        [false, true],
        [false, false],
        [false, 0],
        [false, 1],
        [false, [1,2,3]],
        [false, []],
        [false, ()=>{}],
        [false, function(){}],
        [false, new Map()],
        [false, new Set()],
        [true, {}],
        [true, Object({})],
        [true, Object.create(null)],
        [true, new Object({})],
    ])("should return %s for %s", (result, val) => {
        expect(isPlainObject(val)).toBe(result);
    });
});
