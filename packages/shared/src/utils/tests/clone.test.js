import clone from "../clone";

describe("clone (deep) tests", () => {

    it("should return new object with all enumerable props in all levels", () => {

        const obj = {
            a: "b",
            level2: {
                b: "c",
            },
            level2_1: {
                c: "d"
            },
            d: "e",
            e: undefined,
        };

        const result = clone(obj);

        expect(result).not.toBe(obj);
        expect(result).toEqual(obj);
    });

});
