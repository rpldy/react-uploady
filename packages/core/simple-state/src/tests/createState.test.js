import getInitialData from "./mocks/getTestData.mock";
import { clone } from "@rpldy/shared";
import createState, { unwrap, isProxy } from "../createState";

vi.mock("@rpldy/shared", async () => {
    const shared = await vi.importActual("@rpldy/shared");
    return {
        isPlainObject: shared.isPlainObject,
        clone: vi.fn(),
        getMerge: () => {
        },
        isProduction: () => false,
        hasWindow: () => true,
    };
});

describe("createState tests", () => {
    beforeEach(() => {
        clearViMocks(
            clone
        );
    });

    it("should deep proxy object", () => {
        const initial = getInitialData();
        const { state } = createState(initial);

        expect(state).not.toBe(initial);

        state.arr.push(4);
        expect(state.arr).toHaveLength(3);

        state.arr[0] = 10;
        expect(state.arr[0]).toBe(1);
        state.arr[4] = 1111;
        expect(state.arr[4]).toBeUndefined();

        state.arr.splice(0, 1);
        expect(state.arr).toHaveLength(3);

        state.children[0].name = "foo";
        expect(state.children[0].name).toBe("child-a");

        state.sub.newVal = 123;
        expect(state.sub.newVal).toBeUndefined();

        delete state.sub.foo;
        expect(state.sub.foo).toBe("bar");
    });

    it("should not proxy react-native file object", () => {
        const initial = {
            rnFile: {
                name: "file",
                size: 111,
                uri: "file://file"
            }
        };

        const { state } = createState(initial);

        expect(isProxy(state)).toBe(true);
        expect(isProxy(state.rnFile)).toBe(false);
    });

    it("should only be updateable through update method", () => {
        const { state, update } = createState(getInitialData());

        const state1 = update((obj) => {
            obj.arr.push(4);
        });

        expect(state1).toBe(state);
        expect(state1.arr).toHaveLength(4);

        const state2 = update((obj) => {
            obj.arr[1] = 10;
            obj.arr[3] = 1111;
            obj.arr.splice(0, 1);
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
        const { state, update } = createState(getInitialData());

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
        const { state, update } = createState(getInitialData());

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
        const { update } = createState(getInitialData());

        expect(() => {
            update(() => {
                update();
            });
        }).toThrow();
    });

    it("should proxy new object trees added with update", () => {
        const { state, update } = createState(getInitialData());

        update((state) => {
            state.section1 = {
                area: 51,
                players: ["ross", "joey"]
            };
        });

        state.section1.players.push("rachel");
        expect(state.section1.players).toHaveLength(2);

        delete state.section1.area;
        expect(state.section1.area).toBe(51);

        const state2 = update((state) => {
            state.section1.players.push("rachel");
        });

        expect(state2.section1.players).toHaveLength(3);
    });

    it("should proxy object with symbol prop", () => {
        const sym = Symbol.for("test-sym");

        const { state } = createState({
            foo: "bar",
            [sym]: true
        });

        expect(state[sym]).toBe(true);
    });

    //TODO: uncomment when this is supported
    // it("should work for existing prop proxy", createTest(() => {
    // 	const { state: child } = createState(getInitialData());
    //
    // 	const { state: parent, update } = createState({
    // 		test: true,
    // 	});
    //
    // 	update((stt) => {
    // 		stt.child = child;
    // 	});
    //
    // 	expect(parent.child.children).toHaveLength(2);
    //
    // 	update((stt) => {
    // 		stt.child.children.push({complex: true});
    // 	});
    //
    // 	expect(parent.child.children).toHaveLength(3);
    // }));

    describe("unwrap tests", () => {
        it("should unwrap entry", () => {
            const initial = getInitialData();
            const { state, unwrap } = createState(initial);

            clone.mockReturnValueOnce("clone");
            const unwrapResult = unwrap(state);

            expect(unwrapResult).toBe("clone");
        });

        it("should do nothing for non-proxy", () => {
            const obj = { test: true };
            const result = unwrap(obj);
            expect(result).toBe(obj);
        });

        it("unwrap export should clone", () => {
            const initial = getInitialData();
            const { state } = createState(initial);

            clone.mockReturnValueOnce("clone");

            const children = unwrap(state.children);
            expect(children).toBe("clone");
        });

        it("should work for exiting proxy", () => {
            const { state } = createState(getInitialData());
            const { state: state2, update } = createState(state);

            update((st) => {
                st.children.push({ reproxy: true });
            });

            expect(state2.children).toHaveLength(3);
            expect(state.children).toHaveLength(3);
        });
    });
});
