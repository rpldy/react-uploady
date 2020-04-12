import produce from "../produce";

describe("produce test", () => {

    it("should run updater", () => {

        const state = {foo: "bar"};

        const result = produce(state, (state)=>{
           state.foo = "car";
           state.name = "test";
        });

        expect(result).toBe(state);
        expect(result).toEqual({
            foo: "car",
            name: "test"
        });
    });
});
