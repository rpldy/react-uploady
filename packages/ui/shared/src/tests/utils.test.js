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

        it("should register and unregister from uploader event", () => {

            const eventHook = generateUploaderEventHook(event);
            const callback = jest.fn();

            const { wrapper } = testCustomHook(eventHook, () => [callback]);

            expect(context.on).toHaveBeenCalledWith(event, callback);
            wrapper.unmount();
            expect(context.off).toHaveBeenCalledWith(event, callback);
        });
    });

    describe("generateUploaderEventHookWithState tests", () => {

        it("should set state with stateCalculator", () => {

            const stateCalculator = jest.fn();
            const p1 = "a", p2 = "b";

            const eventHook = generateUploaderEventHookWithState(event, stateCalculator);
            const callback = jest.fn();

            context.on.mockImplementationOnce((event, internalCallback) => {
                expect(event).toBe(event);
                internalCallback(p1, p2);
            });

            const { wrapper } = testCustomHook(eventHook, () => [callback]);

            expect(stateCalculator).toHaveBeenCalledWith(p1, p2);
            expect(callback).toHaveBeenCalledWith(p1, p2);
            wrapper.unmount();
        });

        it("should set state without callback", () => {

            const stateCalculator = jest.fn();
            const p1 = "a", p2 = "b";

            const eventHook = generateUploaderEventHookWithState(event, stateCalculator);

            context.on.mockImplementationOnce((event, internalCallback) => {
                expect(event).toBe(event);
                internalCallback(p1, p2);
            });

            const { wrapper } = testCustomHook(eventHook, () => []);

            expect(stateCalculator).toHaveBeenCalledWith(p1, p2);

            wrapper.unmount();
        });

    });

    describe("logWarning test", () => {

        it.each([

        ])("should log for falsy values : %s", (val) =>{

        });

        it.each([

        ])("shouldn't log for truthy values : %s", (val) =>{

        });

        it("should'nt log in production", () => {

        });

    });
});
