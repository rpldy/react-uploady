import getUpdateable from "../updateable";

describe("updateable tests", () => {

    const getInitial = () => ({
        arr: [1, 2, 3],
        sub: {
            foo: "bar",
            more: {
                test: true
            },
        },
        children: [
            {
                id: 1,
                name: "child-a"
            },
            {
                id: 2,
                name: "child-b"
            }
        ]
    });

    it("should turn deep obj into 'immutable' ", () => {

        const { state } = getUpdateable(getInitial());

        state.arr.push(4);
        expect(state.arr).toHaveLength(3);

        state.arr[0] = 10;
        expect(state.arr[0]).toBe(1);
        state.arr[4] = 1111;
        expect(state.arr[4]).toBeUndefined();

        state.arr.splice(0,1);
        expect(state.arr).toHaveLength(3);

        state.children[0].name = "foo";
        expect(state.children[0].name).toBe("child-a");

        state.sub.newVal = 123;
        expect(state.sub.newVal).toBe(undefined);

        delete state.sub.foo;
        expect(state.sub.foo).toBe("bar");
    });

    it("should only be updateable through update method", () => {

        const { state, update } = getUpdateable(getInitial());

        const state1 = update((obj) => {
            obj.arr.push(4);
        });

        expect(state1).toBe(state);
        expect(state1.arr).toHaveLength(4);

        const state2 = update((obj) => {
            obj.arr[1] = 10;
            obj.arr[3] = 1111;
            obj.arr.splice(0,1);
            obj.children[0].name = "foo";
            obj.sub.newVal = 123;
        });

        expect(state2.arr[0]).toBe(10);
        expect(state2.arr[2]).toBe(1111);
        expect(state2.children[0].name).toBe("foo");
        expect(state2.sub.newVal).toBe(123);

        state2.sub.newVal = 1234;
        expect(state2.sub.newVal).toBe(123);
    });

    it("should block defining prototype", () => {
        const { state, update } = getUpdateable(getInitial());

        expect(() => {
            Object.defineProperty(state, "someProp", {
                value: 111,
            });
        }).toThrow();

        expect(() => {
            update((obj) => {
                Object.defineProperty(state, "someProp", {
                    value: 111,
                });
            });
        }).toThrow();
    });

    it("should block setPrototypeOf", () => {
        const { state, update } = getUpdateable(getInitial());

        expect(() => {
            Object.setPrototypeOf(state, {});
        }).toThrow();

        expect(() => {
            update((obj) => {
                Object.setPrototypeOf(state, {});
            });
        }).toThrow();
    });

    it("should throw on double update", () => {
        const { update } = getUpdateable(getInitial());

        expect(() => {
            update(() => {
                update();
            });
        }).toThrow();
    });
});
