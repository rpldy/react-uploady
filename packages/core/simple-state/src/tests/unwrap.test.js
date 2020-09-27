import createState, { unwrap, isProxy } from "../createState";
import getInitialData from "./mocks/getTestData.mock";

describe("unwrap integration tests", () => {

    const TEST_SYM = Symbol.for("--__--unwrap-test");

    it("should not touch proxy on unwrap", () => {

        const getBatch = () =>({
            id: "1",
            items: [{id: "i1"}, {id: "i2"}],
            data: {
                test: true
            },
            [TEST_SYM]: true,
        });

        const {state , update} = createState({
            batches: {}
        });

        update((s) => {
            s.batches["1"] = getBatch();
        });

        expect(Object.getOwnPropertySymbols(state.batches["1"])).toHaveLength(2);

        const unwrapped = unwrap(state.batches["1"]);

        expect(Object.getOwnPropertySymbols(unwrapped)).toHaveLength(1);
        expect(Object.getOwnPropertySymbols(state.batches["1"])).toHaveLength(2);

        expect(unwrapped).toEqual(getBatch());
        expect(unwrapped).not.toBe(state.batches["1"]);

        unwrapped._test = true;
        expect(unwrapped._test).toBe(true);
        expect(state.batches["1"]._test).toBeUndefined();
    });

    it("should unwrap entire state", () => {
        const initial = getInitialData();
        const { update, unwrap } = createState(initial);

        update((state) => {
            state.more = {
                items: [1, 2, 3]
            };
        });

        const target = unwrap();

        target.more.test = 123;
        expect(target.more.test).toBe(123);

        expect(target.more.items).toEqual([1, 2, 3]);
        target.more.items.push(4);
        expect(target.more.items).toEqual([1, 2, 3, 4]);

        target.test = {
            foo: "bar"
        };

        target.test.foo = "car";
        expect(target.test.foo).toBe("car");

        expect(isProxy(target)).toBe(false);
    });

    it("should re-proxy unwrapped object", () => {
        const initial = getInitialData();
        const { state, update, unwrap } = createState(initial);

        update((state) => {
            state.more = {
                items: [1, 2, 3]
            };
        });

        const obj = unwrap();

        obj.test = 123;

        expect(state.test).toBeUndefined();
        expect(obj.test).toBe(123);

        const { state: state2, update: update2 } = createState(obj);

        state2.more.items.push(4);
        expect(state2.more.items).toHaveLength(3);

        update2((state) => {
            state.more.items.push(4);
        });

        expect(state2.more.items).toHaveLength(4);
    });

    it("should unwrap symbol props", () => {
        const SYM = Symbol.for("test-sym");

        const obj = {
            foo: "bar",
        };

        Object.defineProperty(obj, SYM, {
            value: true,
            enumerable: true,
            writable: true,
        });

        const { unwrap } = createState(obj);

        const unwrapped = unwrap();

        expect(unwrapped[SYM]).toBe(true);
    });
});
