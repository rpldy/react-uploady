import isPromise from "../isPromise";

describe("isPromise tests", () => {
    it.each([
        [null, false],
        [undefined, false],
        [false, false],
        ["dasd", false],
        [10, false],
        [{}, false],
        [{ test: true }, false],
        [{ then: true }, false],
        [new Promise((resolve) => { resolve(); }), true],
        [Promise.resolve(false), true],
    ])
    ("test isPromise with - %s should be: %s", (obj, result) => {
        expect(isPromise(obj)).toBe(result);
    });
});
