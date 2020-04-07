import devFreeze from "../devFreeze";

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
        const frozen = devFreeze(obj);
        expect(() => {
            frozen.test = true;
        }).toThrow();
    });

    it("should not freeze when in production", () => {

        process.env.NODE_ENV = "production";

        const obj = {};
        const frozen = devFreeze(obj);
        frozen.test = true;
        expect(frozen.test).toBe(true);
    });

});
