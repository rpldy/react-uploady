import triggerUpdater from "../triggerUpdater";

describe("triggerUpdater tests", () => {
	const trigger = vi.fn();

	beforeEach(() => {
		clearViMocks(trigger);
	});

	it("should return function if only trigger is passed", () => {

		const updater = triggerUpdater(trigger);
		expect(updater).toBeInstanceOf(Function);

		updater("test", 1, 2);

		expect(trigger).toHaveBeenCalledWith("test", 1, 2);
	});

	it("should return last updated value", async () => {

		trigger.mockReturnValueOnce(["a", "b"]);

		const updated = await triggerUpdater(trigger, "test", 2);

		expect(updated).toBe("b");
	});

	it("should return last resolved value", async () => {

		trigger.mockReturnValueOnce([
			Promise.resolve("a"),
			Promise.resolve("b"),
			Promise.resolve(null)]);

		const updated = await triggerUpdater(trigger, "test", 2);

		expect(updated).toBe("b");
	});

	it("should return nothing if no listeners", async () => {
		trigger.mockReturnValueOnce(undefined);

		const updated = await triggerUpdater(trigger, "test", 2);

		expect(updated).toBeUndefined();
	});

	it("should return falsy value", async () => {
		trigger.mockReturnValueOnce([
			Promise.resolve(0),
			Promise.resolve(),
		]);

		const updated = await triggerUpdater(trigger, "test");

		expect(updated).toBe(0);
	});

	it("should return nothing if listeners return nothing", async () => {
		trigger.mockReturnValueOnce([]);

		const updated = await triggerUpdater(trigger, "test");

		expect(updated).toBeUndefined();
	});

	it("should return nothing if all listeners return nothing", async () => {
		trigger.mockReturnValueOnce([
			Promise.resolve(null),
			Promise.resolve(undefined)
		]);

		const updated = await triggerUpdater(trigger, "test");

		expect(updated).toBeUndefined();
	});

	it("should throw when rejected", async () => {
		trigger.mockImplementationOnce(() => [Promise.reject("baaa")]);

		expect(triggerUpdater(trigger, "test")).rejects.toBe("baaa");
	});
});
