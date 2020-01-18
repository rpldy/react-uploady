jest.mock("../assertContext", () => jest.fn());
import testCustomHook from "/test/testCustomHook";
import mockAssertContext from "../assertContext";
import {
	generateUploaderEventHook,
	generateUploaderEventHookWithState
} from "../utils";

describe("ui-shared utils tests", () => {
	const event = "TEST_EVENT";
	const context = {
		uploader: {
			on: jest.fn(),
			off: jest.fn(),
		}
	};

	beforeAll(() => {
		mockAssertContext.mockReturnValue(context);
	});

	beforeEach(() => {
		clearJestMocks(
			mockAssertContext,
		);
	});

	describe("generateUploaderEventHook tests", () => {

		it("should register and unregister from uploader event", () => {

			const eventHook = generateUploaderEventHook(event);
			const callback = jest.fn();

			const { wrapper } = testCustomHook(() => eventHook(callback));

			expect(context.uploader.on).toHaveBeenCalledWith(event, callback);
			wrapper.unmount();
			expect(context.uploader.off).toHaveBeenCalledWith(event, callback);
		});
	});

	describe("generateUploaderEventHookWithState tests", () => {

		it("should set state with stateCalculator", () => {

			const stateCalculator = jest.fn();
			const p1 = "a", p2 = "b";

			const eventHook = generateUploaderEventHookWithState(event, stateCalculator);
			const callback = jest.fn();

			context.uploader.on.mockImplementationOnce((event, internalCallback) => {
				expect(event).toBe(event);
				internalCallback(p1, p2);
			});

			const { wrapper } = testCustomHook(() => eventHook(callback));

			expect(stateCalculator).toHaveBeenCalledWith(p1, p2);
			expect(callback).toHaveBeenCalledWith(p1, p2);
			wrapper.unmount();
		});

		it("should set state without callback", () => {

			const stateCalculator = jest.fn();
			const p1 = "a", p2 = "b";

			const eventHook = generateUploaderEventHookWithState(event, stateCalculator);

			context.uploader.on.mockImplementationOnce((event, internalCallback) => {
				expect(event).toBe(event);
				internalCallback(p1, p2);
			});

			const { wrapper } = testCustomHook(() => eventHook());

			expect(stateCalculator).toHaveBeenCalledWith(p1, p2);

			wrapper.unmount();
		});

	});
});