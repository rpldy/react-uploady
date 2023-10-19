import triggerCancellable from "../triggerCancellable";

describe("triggerCancellable tests", () => {
	const trigger = vi.fn();

	beforeEach(() => {
		clearViMocks(trigger);
	});

	it("should return function if only trigger is passed", () => {
		const cancellable = triggerCancellable(trigger);
		expect(cancellable).toBeInstanceOf(Function);

		cancellable("test", 1, 2);

		expect(trigger).toHaveBeenCalledWith("test", 1, 2);

	});

	it("should return true if trigger returns false", async () => {
		trigger.mockReturnValueOnce([true, false]);

		const isCancelled = await triggerCancellable(trigger, "test", 2);

		expect(isCancelled).toBe(true);
	});

	it("should return true if trigger resolved with false", async () => {
		trigger.mockReturnValueOnce([
			Promise.resolve(true),
			Promise.resolve(false)]);

		const isCancelled = await triggerCancellable(trigger, "test", 2);

		expect(isCancelled).toBe(true);
	});

	it("should return false if no result was false", async () => {
		trigger.mockReturnValueOnce([undefined, null, 0]);

		const isCancelled = await triggerCancellable(trigger, "test", 2);

		expect(isCancelled).toBe(false);
	});

	it("should throw when rejected", async () => {
		trigger.mockImplementationOnce(() => [Promise.reject("baaa")]);

		expect(triggerCancellable(trigger, "test")).rejects.toBe("baaa");
	});
});
