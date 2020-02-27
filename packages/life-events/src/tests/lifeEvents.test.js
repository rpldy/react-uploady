import addLife, { isLE } from "../lifeEvents";

describe("life-events tests", () => {
	const noOp = jest.fn();

	beforeEach(() => {
		clearJestMocks(noOp);
	});

	describe("init tests", () => {

		it("isLE should return false for null/undefined", () => {
			expect(isLE(null)).toBe(false);
			expect(isLE(undefined)).toBe(false);
		});

		it("should add LE to existing object", () => {

			const obj = { foo: "bar" };

			expect(isLE(obj)).toBe(false);
			addLife(obj);
			expect(isLE(obj)).toBe(true);
		});

		it("should create LE without existing object", () => {
			const api = addLife();
			expect(isLE(api.target)).toBe(true);
		});

		it("should create with defined events", () => {

			const obj = {};
			addLife(obj, ["test", "test2"]);
			expect(obj.getEvents()).toEqual(["test", "test2"]);
		});

		it("should be safe to addLife more than once", () => {
			const obj = {};
			addLife(obj, ["test", "test2"]);
			addLife(obj, ["test", "test2"]);
			expect(obj.getEvents()).toEqual(["test", "test2"]);
		});
	});

	describe("add regs tests", () => {

		it("should add reg ", () => {
			const obj = { foo: "bar" };
			const api = addLife(obj);

			obj.on("test", noOp);
			expect(api.hasEventRegistrations("test")).toBe(true);
		});

		it.each([
			Symbol.for("test-name"),
			1,
			{}
		])("should add reg using non-strings %s", (name) => {
			const obj = { foo: "bar" };
			const api = addLife(obj);

			obj.on(name, noOp);
			expect(api.hasEventRegistrations(name)).toBe(true);
		});

		it("should add reg once", () => {
			const obj = { foo: "bar" };
			const api = addLife(obj);

			obj.once("test", noOp);
			expect(api.hasEventRegistrations("test")).toBe(true);
		});

		it("shouldn't fail to add reg for existing event with allow flag is false", () => {
			const obj = {};
			addLife(obj, ["test"], { allowRegisterNonExistent: false });

			expect(() => {
				obj.on("test", noOp);
			}).not.toThrow();
		});

		it("should fail to add reg when event doesnt exist and allow flag is false", () => {
			const obj = {};
			addLife(obj, [], { allowRegisterNonExistent: false });

			expect(() => {
				obj.on("test", noOp);
			}).toThrow(/Cannot register for event/);
		});

		it("should only add same callback once", () => {

			const api = addLife();

			api.target.on("test", noOp);
			api.target.on("test", noOp);
			api.target.on("test-2", noOp);

			api.trigger("test");
			api.trigger("test-2");

			expect(noOp).toHaveBeenCalledTimes(2);
		});
	});

	describe("trigger tests", () => {

		it("trigger with no regs should return undefined", () => {
			const api = addLife();
			const result = api.trigger("test");

			expect(result).toBeUndefined();
		});

		it.each([1, 2, 3, 4, 5, 6])("should trigger with different arg count: %s", (argNum) => {
			const api = addLife();
			api.target.on("test", noOp);

			const args = new Array(argNum).fill("a");
			api.trigger("test", ...args);

			expect(noOp.mock.calls[0]).toHaveLength(argNum);
		});

		it("trigger reg with no value shold return undefined", () => {
			const api = addLife();
			api.target.on("test", noOp);
			const result = api.trigger("test", 1, 2);

			expect(result).toBeUndefined();
			expect(noOp).toHaveBeenCalledWith(1, 2);
		});

		it("should trigger reg with boolean return value", async () => {

			const api = addLife();
			api.target.on("test", () => true);
			api.target.on("test", () => false);
			const result = api.trigger("test");

			const results = await Promise.all(result);

			expect(results).toEqual([true, false]);
		});

		it("should trigger reg with promise return value", async () => {
			const api = addLife();
			api.target.on("test", () => Promise.resolve(true));
			api.target.on("test", () => Promise.resolve(false));
			const result = api.trigger("test");

			const results = await Promise.all(result);

			expect(results).toEqual([true, false]);
		});

		describe("once tests", () => {
			it("should remove once after trigger", () => {
				const api = addLife();
				api.target.once("test", noOp);

				api.trigger("test", "a");
				api.trigger("test", "b");

				expect(noOp).toHaveBeenCalledTimes(1);
				expect(noOp).toHaveBeenCalledWith("a");
				expect(noOp).not.toHaveBeenCalledWith("b");
			});

			it("should only remove onces", async () => {

				const handler1 = () => "b",
					handler2 = () => "c",
					handler3 = () => "e";

				const api = addLife();
				api.target.once("test", () => "a");
				api.target.on("test", handler1);
				api.target.on("test", handler2);
				api.target.once("test", () => "d");
				api.target.on("test", handler3);

				const results = await Promise.all(api.trigger("test"));
				expect(results).toEqual(["a", "b", "c", "d", "e"]);

				const results2 = await Promise.all(api.trigger("test"));
				expect(results2).toEqual(["b", "c", "e"]);
			});

			it("should only remove onces for the correct name", async () => {
				const api = addLife();
				api.target.once("test", () => "a");
				api.target.on("test", () => "b");
				api.target.on("test", () => "c");
				api.target.once("test-2", () => "d");
				api.target.on("test-2", () => "e");

				const results = await Promise.all(api.trigger("test"));
				expect(results).toEqual(["a", "b", "c"]);

				const results2 = await Promise.all(api.trigger("test-2"));
				expect(results2).toEqual(["d", "e"]);

				const results3 = await Promise.all(api.trigger("test"));
				expect(results3).toEqual(["b", "c"]);

				const results4 = await Promise.all(api.trigger("test-2"));
				expect(results4).toEqual(["e"]);
			});

			it("triggering within once handler shouldnt call it", () => {

				const handler = jest.fn(() => {
					api.trigger("test")
				});

				const api = addLife();
				api.target.once("test", handler);
				api.trigger("test");

				expect(handler).toHaveBeenCalledTimes(1);
			});
		});

	});

	describe("unregister tests", () => {

		it("off should remove registration for specific cb", () => {

			const api = addLife();
			api.target.on("test", noOp);

			expect(api.hasEventRegistrations("test")).toBe(true);

			api.target.off("test", noOp);
			expect(api.hasEventRegistrations("test")).toBe(false);
		});

		it("off should remove registrations for name ", () => {
			const api = addLife();
			api.target.on("test", noOp);
			api.target.on("test", () => {
			});

			expect(api.hasEventRegistrations("test")).toBe(true);

			api.target.off("test");
			expect(api.hasEventRegistrations("test")).toBe(false);
		});
	});

	describe("events tests", () => {

		it("should be able to add event ", () => {

			const api = addLife(null, ["test"]);
			api.addEvent("test-2");
			const events = api.target.getEvents();

			expect(events).toEqual(["test", "test-2"]);
		});

		it("shouldnt be possible to add same as existing event", () => {

			const api = addLife(null, ["test"],);

			expect(() => {
				api.addEvent("test");
			}).toThrow("Event 'test' already defined");
		});

		it("shouldnt be possible to add event if flag is false", () => {
			const api = addLife(null, ["test"], { canAddEvents: false });

			expect(() => {
				api.addEvent("test-2");
			}).toThrow("Cannot add new events")

		});

		it("should be able to remove event", () => {
			const api = addLife(null, ["test", "test-2"],);

			api.removeEvent("test");
			expect(api.target.getEvents()).toEqual((["test-2"]));
		});

		it("shouldnt be able to remove event if flag is false", () => {
			const api = addLife(null, ["test", "test-2"], { canRemoveEvents: false });

			expect(() => {
				api.removeEvent("test");
			}).toThrow("Cannot remove events")
		});

		it("should return true if has event", () => {
			const api = addLife(null, ["test"]);
			expect(api.hasEvent("test")).toBe(true);
		});
	});

	describe("assign tests", () => {

		it("should be possible to assign life to another object", () => {

			const obj = {};
			const { assign } = addLife(obj, ["test", "test-2"], { canAddEvents: false });
			obj.on("test", noOp);

			const obj2 = {clone: true};
			const { trigger, addEvent, hasEvent, hasEventRegistrations } = assign(obj2);

			expect(hasEvent("test")).toBe(true);
			expect(hasEventRegistrations("test")).toBe(true);

			trigger("test", "aaa");

			expect(noOp).toHaveBeenCalledWith("aaa");

			expect(() => addEvent("test-3")).toThrow("Cannot add new events");

		});

	});
});
