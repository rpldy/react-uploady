import * as utils from "../utils";

describe("shared utils tests", () => {

    describe("isFunction tests", () => {

        it("should return true for function", () => {

            const fn1 = () => {
            };

            function fn2() {
            }

            expect(utils.isFunction(fn1)).toBe(true);
            expect(utils.isFunction(fn2)).toBe(true);
        });

        it("should return false for anything not a function", () => {

            expect(utils.isFunction({})).toBe(false);
            expect(utils.isFunction(null)).toBe(false);
            expect(utils.isFunction(false)).toBe(false);
            expect(utils.isFunction("a")).toBe(false);
            expect(utils.isFunction(true)).toBe(false);
        });
    });

    describe("isSamePropInArrays tests", () => {

        it("should return true if same prop", () => {
            const result = utils.isSamePropInArrays(
                [{ foo: "a" }, { foo: "b" }],
                [{ foo: "a" }, { foo: "b" }],
                "foo");

            expect(result).toBe(true);
        });

        it("should return true if same props", () => {

            const result = utils.isSamePropInArrays(
                [{ foo: "a", bar: "1" }, { foo: "b", bar: "2", c: "test" }],
                [{ foo: "a", bar: "1" }, { foo: "b", bar: "2", c: "test2" }],
                ["foo", "bar"]);

            expect(result).toBe(true);
        });

        it("should return true if same props not just strings", () => {
            const result = utils.isSamePropInArrays(
                [{ foo: "a", bar: false }, { foo: "b", bar: true, c: "test" }],
                [{ foo: "a", bar: false }, { foo: "b", bar: true, c: "test2" }],
                ["foo", "bar"]);

            expect(result).toBe(true);
        });

        it("should return true if same props even with diff refs", () => {
            const result = utils.isSamePropInArrays(
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
            const result = utils.isSamePropInArrays(
                [{ foo: "a" }, { foo: "b" }],
                [{ foo: "a" }, { foo: "b" }, { foo: "c" }],
                "foo");

            expect(result).toBe(false);
        });

        it("should return true if same arrays", () => {
            const arr = [];
            expect(utils.isSamePropInArrays(arr, arr, "test"))
                .toBe(true);
        });

        it("should return true for empty arrays ", () => {
            expect(utils.isSamePropInArrays([], [], "test"))
                .toBe(true);
        });

        it("should return false if one is falsy", () => {

            expect(utils.isSamePropInArrays([], null, "test"))
                .toBe(false);

            expect(utils.isSamePropInArrays(undefined, null, "test"))
                .toBe(false);
        });

    });

    describe("devFreeze tests", () => {
        let env;

        beforeAll(() => {
            env = process.env.NODE_ENV;
        });

        afterAll(() => {
            process.env.NODE_ENV = env;
        });

        it("should freeze when not in production", () => {
            const obj = {};
            const frozen = utils.devFreeze(obj);
            expect(() => {
                frozen.test = true;
            }).toThrow();
        });

        it("should not freeze when in production", () => {

            process.env.NODE_ENV = "production";

            const obj = {};
            const frozen = utils.devFreeze(obj);
            frozen.test = true;
            expect(frozen.test).toBe(true);
        });

    });
});
