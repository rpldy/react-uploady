import {
    generateUploaderEventHook,
    generateUploaderEventHookWithState,
} from "../hooksUtils";
import assertContext from "../../assertContext";

vi.mock("../../assertContext"); //, () => vi.fn());

describe("hooks utils tests", () => {
    const event = "TEST_EVENT";

    const context = {
        on: vi.fn(),
        off: vi.fn(),
    };

    beforeAll(() => {
        assertContext.mockReturnValue(context);
    });

    beforeEach(() => {
        clearViMocks(
            assertContext,
        );
    });

    describe("generateUploaderEventHook tests", () => {
        it("should register and unregister from uploader event without scope", () => {
            const eventHook = generateUploaderEventHook(event);
            const callback = vi.fn(() => "cb-result");
            const p1 = "a", p2 = "b";

            context.on.mockImplementationOnce((eventName, internalCallback) => {
                expect(eventName).toBe(event);
                const cbResult = internalCallback(p1, p2);
                expect(cbResult).toBe("cb-result");
            });

            const { unmount } = renderHook(() => eventHook(callback));

            expect(context.on).toHaveBeenCalledWith(event, expect.any(Function));
            expect(callback).toHaveBeenCalledWith(p1, p2);

            unmount();
            expect(context.off).toHaveBeenCalledWith(event, expect.any(Function));
            expect(callback).toHaveBeenCalled();
        });

        it("should register and unregister from uploader event with scope", () => {
            const eventHook = generateUploaderEventHook(event);
            const callback = vi.fn(() => "cb-result");
            const item = { id: "f1" };

            context.on.mockImplementationOnce((eventName, internalCallback) => {
                expect(eventName).toBe(event);
                const cbResult = internalCallback(item);
                expect(cbResult).toBe("cb-result");
                const noResult = internalCallback({ id: "f2" });
                expect(noResult).toBeUndefined();
            });

            const { unmount } = renderHook(() => eventHook(callback, "f1"));

            expect(context.on).toHaveBeenCalledWith(event, expect.any(Function));
            expect(callback).toHaveBeenCalledWith(item);
            expect(callback).toHaveBeenCalledTimes(1);

            unmount();
            expect(context.off).toHaveBeenCalledWith(event, expect.any(Function));
            expect(callback).toHaveBeenCalled();
        });

        it("should ignore scope for hook with canScope = false", () => {
            const eventHook = generateUploaderEventHook(event, false);
            const callback = vi.fn();
            const item = { id: "f1" };
            const item2 = { id: "f2" };

            context.on.mockImplementationOnce((eventName, internalCallback) => {
                expect(eventName).toBe(event);
                internalCallback(item);
                internalCallback(item2);
                internalCallback(null);
            });

            const { unmount } = renderHook(() => eventHook(callback, "f1"));

            expect(context.on).toHaveBeenCalledWith(event, expect.any(Function));
            expect(callback).toHaveBeenCalledWith(item);
            expect(callback).toHaveBeenCalledWith(item2);
            expect(callback).toHaveBeenCalledTimes(3);

            unmount();
        });
    });

    describe("generateUploaderEventHookWithState tests", () => {
        it("should set state with stateCalculator", () => {
            const stateCalculator = vi.fn();
            const p1 = "a", p2 = "b";

            const eventHook = generateUploaderEventHookWithState(event, stateCalculator);
            const callback = vi.fn();

            context.on.mockImplementationOnce((eventName, internalCallback) => {
                expect(eventName).toBe(event);
                internalCallback(p1, p2);
            });

            const { unmount } = renderHook(() => eventHook(callback));

            expect(stateCalculator).toHaveBeenCalledWith(p1, p2);
            expect(callback).toHaveBeenCalledWith(p1, p2);
            unmount();
        });

        it("should set state with stateCalculator only for scope", () => {
            const stateCalculator = vi.fn();
            const item = { id: "f1" };

            const eventHook = generateUploaderEventHookWithState(event, stateCalculator);
            const callback = vi.fn();

            context.on.mockImplementationOnce((eventName, internalCallback) => {
                expect(eventName).toBe(event);
                internalCallback(item);
                internalCallback({ id: "f2" });
            });

            const { unmount } = renderHook(() => eventHook(callback, "f1"));

            expect(stateCalculator).toHaveBeenCalledWith(item);
            expect(callback).toHaveBeenCalledWith(item);
            expect(callback).toHaveBeenCalledTimes(1);
            expect(stateCalculator).toHaveBeenCalledTimes(1);

            unmount();
        });

        it("should set state without callback", () => {
            const stateCalculator = vi.fn();
            const p1 = "a", p2 = "b";

            const eventHook = generateUploaderEventHookWithState(event, stateCalculator);

            context.on.mockImplementationOnce((eventName, internalCallback) => {
                expect(eventName).toBe(event);
                internalCallback(p1, p2);
            });

            const { unmount } = renderHook(eventHook);

            expect(stateCalculator).toHaveBeenCalledWith(p1, p2);

            unmount();
        });

        it("should set state with only scope", () => {
            const stateCalculator = vi.fn((state) => ({ ...state }));
            const item = { id: "f1" };

            const eventHook = generateUploaderEventHookWithState(event, stateCalculator);

            context.on.mockImplementationOnce((eventName, internalCallback) => {
                expect(eventName).toBe(event);
                internalCallback(item);
                internalCallback({ id: "f2" });
            });

            const { unmount, result } = renderHook(() => eventHook("f1"));

            expect(stateCalculator).toHaveBeenCalledWith(item);
            expect(stateCalculator).toHaveBeenCalledTimes(1);
            expect(result.current).toStrictEqual(item);

            unmount();
        });
    });
});
