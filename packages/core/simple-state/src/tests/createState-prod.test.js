import getInitialData from "./mocks/getTestData.mock";
import { clone } from "@rpldy/shared";
import createState, { unwrap } from "../createState";

vi.mock("@rpldy/shared", async () => {
    const shared = await vi.importActual("@rpldy/shared");
    return {
        isPlainObject: shared.isPlainObject,
        clone: vi.fn(),
        getMerge: () => {
        },
        isProduction: () => true,
        hasWindow: () => true,
    };
});

describe("createState - production tests", () => {
    beforeEach(() => {
        clearViMocks(
            clone
        );
    });

    it("should not proxy in production", () => {
        const initial = getInitialData();
        const { state, update } = createState(initial);

        expect(state).toBe(initial);

        const state1 = update((obj) => {
            obj.arr.push(4);
        });

        expect(state1).toBe(state);
        expect(state1.arr).toHaveLength(4);
    });

    describe("unwrap tests", () => {
        it("should unwrap to same object in production", () => {
            const initial = getInitialData();
            const { unwrap } = createState(initial);

            const org = unwrap();
            expect(org).toBe(initial);
        });

        it("unwrap export should return same object in production", () => {
            const { state } = createState(getInitialData());

            const children = unwrap(state.children);

            expect(children).toBe(state.children);
        });
    });
});
