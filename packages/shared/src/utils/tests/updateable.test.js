import getUpdateable from "../updateable";

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

	afterAll(() => {
		process.env.NODE_ENV = env;
	});

	it("should turn deep obj into 'immutable' ", () => {

		const initial = getInitial();
		const { state } = getUpdateable(initial);

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

		const { state, update } = getUpdateable(getInitial());

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
		const { state, update } = getUpdateable(getInitial());

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
		const { state, update } = getUpdateable(getInitial());

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
		const { update } = getUpdateable(getInitial());

		expect(() => {
			update(() => {
				update();
			});
		}).toThrow();
	});

	it("should proxy new object trees added with update", () => {

		const { state, update } = getUpdateable(getInitial());

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

		const state2 = update((state) =>{
			state.section1.players.push("rachel");
		});

		expect(state2.section1.players).toHaveLength(3);
	});

	it("should not proxy in production", () => {

		process.env.NODE_ENV = "production";

		const initial = getInitial();
		const { state, update } = getUpdateable(initial);

		expect(state).toBe(initial);

		const state1 = update((obj) => {
			obj.arr.push(4);
		});

		expect(state1).toBe(state);
		expect(state1.arr).toHaveLength(4);
	});
});
