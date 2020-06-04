import assertContext from "../assertContext";
import {
    generateUploaderEventHook,
    generateUploaderEventHookWithState,
    logWarning,
} from "../utils";

jest.mock("../assertContext", () => jest.fn());

describe("ui-shared utils tests", () => {
    const event = "TEST_EVENT";
    const context = {
        on: jest.fn(),
        off: jest.fn(),
    };

    beforeAll(() => {
        assertContext.mockReturnValue(context);
    });

    beforeEach(() => {
        clearJestMocks(
            assertContext,
        );
    });

    describe("generateUploaderEventHook tests", () => {

        it("should register and unregister from uploader event without scope", () => {
            const eventHook = generateUploaderEventHook(event);
            const callback = jest.fn();
			const p1 = "a", p2 = "b";

			context.on.mockImplementationOnce((eventName, internalCallback) => {
				expect(eventName).toBe(event);
				internalCallback(p1, p2);
			});

            const { wrapper } = testCustomHook(eventHook, () => [callback]);

            expect(context.on).toHaveBeenCalledWith(event, expect.any(Function));
			expect(callback).toHaveBeenCalledWith(p1, p2);

            wrapper.unmount();
            expect(context.off).toHaveBeenCalledWith(event, expect.any(Function));
        });

		it("should register and unregister from uploader event with scope ", () => {
			const eventHook = generateUploaderEventHook(event);
			const callback = jest.fn();
			const item = { id: "f1" };

			context.on.mockImplementationOnce((eventName, internalCallback) => {
				expect(eventName).toBe(event);
				internalCallback(item);
				internalCallback({ id: "f2" });
			});

			const { wrapper } = testCustomHook(eventHook, () => [callback, "f1"]);

			expect(context.on).toHaveBeenCalledWith(event, expect.any(Function));
			expect(callback).toHaveBeenCalledWith(item);
			expect(callback).toHaveBeenCalledTimes(1);

			wrapper.unmount();
			expect(context.off).toHaveBeenCalledWith(event, expect.any(Function));
		});

		it("should ignore scope for hook with canScope = false", () => {
			const eventHook = generateUploaderEventHook(event, false);
			const callback = jest.fn();
			const item = { id: "f1" };
			const item2 = { id: "f2" };

			context.on.mockImplementationOnce((eventName, internalCallback) => {
				expect(eventName).toBe(event);
				internalCallback(item);
				internalCallback(item2);
				internalCallback(null);
			});

			const { wrapper } = testCustomHook(eventHook, () => [callback, "f1"]);

			expect(context.on).toHaveBeenCalledWith(event, expect.any(Function));
			expect(callback).toHaveBeenCalledWith(item);
			expect(callback).toHaveBeenCalledWith(item2);
			expect(callback).toHaveBeenCalledTimes(3);

			wrapper.unmount();

		});
	});

    describe("generateUploaderEventHookWithState tests", () => {

        it("should set state with stateCalculator", () => {

            const stateCalculator = jest.fn();
            const p1 = "a", p2 = "b";

            const eventHook = generateUploaderEventHookWithState(event, stateCalculator);
            const callback = jest.fn();

            context.on.mockImplementationOnce((eventName, internalCallback) => {
                expect(eventName).toBe(event);
                internalCallback(p1, p2);
            });

            const { wrapper } = testCustomHook(eventHook, () => [callback]);

            expect(stateCalculator).toHaveBeenCalledWith(p1, p2);
            expect(callback).toHaveBeenCalledWith(p1, p2);
            wrapper.unmount();
        });

		it("should set state with stateCalculator only for scope", () => {

			const stateCalculator = jest.fn();
			const item = { id: "f1" };

			const eventHook = generateUploaderEventHookWithState(event, stateCalculator);
			const callback = jest.fn();

			context.on.mockImplementationOnce((eventName, internalCallback) => {
				expect(eventName).toBe(event);
				internalCallback(item);
				internalCallback({ id: "f2" });
			});

			const { wrapper } = testCustomHook(eventHook, () => [callback, "f1"]);

			expect(stateCalculator).toHaveBeenCalledWith(item);
			expect(callback).toHaveBeenCalledWith(item);
			expect(callback).toHaveBeenCalledTimes(1);
			expect(stateCalculator).toHaveBeenCalledTimes(1);

			wrapper.unmount();
		});

        it("should set state without callback", () => {

            const stateCalculator = jest.fn();
            const p1 = "a", p2 = "b";

            const eventHook = generateUploaderEventHookWithState(event, stateCalculator);

            context.on.mockImplementationOnce((eventName, internalCallback) => {
                expect(eventName).toBe(event);
                internalCallback(p1, p2);
            });

            const { wrapper } = testCustomHook(eventHook, () => []);

            expect(stateCalculator).toHaveBeenCalledWith(p1, p2);

            wrapper.unmount();
        });

    });

    describe("logWarning test", () => {
        let mockWarn, env;

        beforeAll(() => {
            mockWarn = jest.spyOn(console, "warn");
            mockWarn.mockImplementation(()=>{});
            env = process.env.NODE_ENV;
        });

        afterAll(() => {
            mockWarn.mockRestore();
        });

        beforeEach(() => {
            clearJestMocks(mockWarn);
        });

        afterEach(() => {
            process.env.NODE_ENV = env;
        });

        it.each([
            false,
            null,
            undefined,
            0,
        ])("should log for falsy values : %s", (val) => {
            logWarning(val, "warning");
            expect(mockWarn).toHaveBeenCalledWith("warning");
        });

        it.each([
            true,
            {},
            "test",
            1,
        ])("shouldn't log for truthy values : %s", (val) => {
            logWarning(val, "warning");
            expect(mockWarn).not.toHaveBeenCalled();
        });

        it("should'nt log in production", () => {
            process.env.NODE_ENV = "production";
            logWarning(null, "warning");
            expect(mockWarn).not.toHaveBeenCalled();
        });

    });
});
