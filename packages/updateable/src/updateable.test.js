import makeUpdateable, { unwrap } from "./updateable";

describe("updateable tests", () => {
	let env;

	const getInitial = () => ({
		arr: [1, 2, 3],
		sub: {
			foo: "bar",
			more: {
				test: true
			},
		},
		children: [
			{
				id: 1,
				name: "child-a"
			},
			{
				id: 2,
				name: "child-b"
			}
		]
	});

	beforeAll(() => {
		env = process.env.NODE_ENV;
	});

	beforeEach(() => {
		process.env.NODE_ENV = env;
	});

	it("should deep proxy object ", () => {

		const initial = getInitial();
		const { state } = makeUpdateable(initial);

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
		expect(state.sub.newVal).toBe(undefined);

		delete state.sub.foo;
		expect(state.sub.foo).toBe("bar");
	});

	it("should only be updateable through update method", () => {

		const { state, update } = makeUpdateable(getInitial());

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
		const { state, update } = makeUpdateable(getInitial());

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
		const { state, update } = makeUpdateable(getInitial());

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
		const { update } = makeUpdateable(getInitial());

		expect(() => {
			update(() => {
				update();
			});
		}).toThrow();
	});

	it("should proxy new object trees added with update", () => {

		const { state, update } = makeUpdateable(getInitial());

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

	it("should not proxy in production", () => {

		process.env.NODE_ENV = "production";

		const initial = getInitial();
		const { state, update } = makeUpdateable(initial);

		expect(state).toBe(initial);

		const state1 = update((obj) => {
			obj.arr.push(4);
		});

		expect(state1).toBe(state);
		expect(state1.arr).toHaveLength(4);
	});

	it("should unwrap to same object in production", () => {
		process.env.NODE_ENV = "production";

		const initial = getInitial();
		const { unwrap } = makeUpdateable(initial);

		const org = unwrap();
		expect(org).toBe(initial);
	});

	it("unwrap export should return same object in production", () => {

		process.env.NODE_ENV = "production";

		const { state } = makeUpdateable(getInitial());

		const children = unwrap(state.children);

		expect(children).toBe(state.children);
	});

	it("should unwrap entire proxy", () => {
		const initial = getInitial();
		const { update, unwrap } = makeUpdateable(initial);

		update((state) => {
			state.more = {
				items: [1, 2, 3]
			};
		});

		const target = unwrap();

		expect(target).toBe(initial);

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
	});

	it("should unwrap entry", () => {
		const initial = getInitial();
		const { state, update, unwrap } = makeUpdateable(initial);

		update((state) => {
			state.more = {
				items: [1, 2, 3]
			};
		});

		const entry = unwrap(state.more);

		entry.test = 123;
		expect(entry.test).toBe(123);

		expect(entry.items).toEqual([1, 2, 3]);
		entry.items.push(4);
		expect(entry.items).toEqual([1, 2, 3, 4]);
	});

	it("should do nothing for non-proxy", () => {
		const obj = { test: true };
		const result = unwrap(obj);
		expect(result).toBe(obj);
	});

	it("should be able to re-proxy unwrapped object", () => {

		const initial = getInitial();
		const { state, update, unwrap } = makeUpdateable(initial);

		update((state) => {
			state.more = {
				items: [1, 2, 3]
			};
		});

		const entry = unwrap(state.more);

		entry.test = 123;

		update((state) => {
			state.more = entry;
		});

		expect(state.more.test).toBe(123);
		state.more.test = 1234;
		expect(state.more.test).toBe(123);

		update((state) => {
			state.more.test = 1234;
		});

		expect(state.more.test).toBe(1234);
	});

	it("unwrap export should do unwrap", () => {
		const initial = getInitial();
		const { state } = makeUpdateable(initial);

		const children = unwrap(state.children);

		children.push({
			another: true
		});

		expect(children).toHaveLength(3);

		children[2].foo = "bar";
		expect(children[2].foo).toBe("bar");
	});

	it("should handle wrap for existing proxy", () => {

		const { state } = makeUpdateable(getInitial());
		const { state: state2, update } = makeUpdateable(state);

		update((state) => {
			state.children.push({ test: true });
		});

		expect(state2.children[2].test).toBe(true);
		expect(state.children[2].test).toBe(true);
	});

	it("should do nothing for simple values", () => {
		const str = unwrap("test");
		expect(str).toBe("test");

		const num = unwrap(4);
		expect(num).toBe(4);
	});
});
