import getInitialData from "./mocks/getTestData.mock";

describe("createState tests", () => {
	const env = process.env.NODE_ENV;
	let clone, createState, unwrap, isProxy;

	beforeEach(() => {
		clearJestMocks(
			clone
		);
	});

	afterAll(() => {
		process.env.NODE_ENV = env;
	});

	const createTest = (runTest, isProd = false) =>
		() => {
			jest.resetModules();

			const mockClone = jest.fn();
			clone = mockClone;

			jest.doMock("@rpldy/shared", () => ({
				isPlainObject: jest.requireActual("@rpldy/shared").isPlainObject,
				clone: mockClone,
				getMerge: () => {},
                isProduction: () => isProd,
                hasWindow: () => true,
			}));

			const mdl = require("../createState");
			createState = mdl.default;
			unwrap = mdl.unwrap;
			isProxy = mdl.isProxy;

			runTest();
		};

	it("should deep proxy object", createTest(() => {
		const initial = getInitialData();
		const { state } = createState(initial);

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
	}));

    it("should not proxy react-native file object", createTest(() => {
        const initial = {
            rnFile: {
                name: "file",
                size: 111,
                uri: "file://file"
            }
        };

        const { state } = createState(initial);

        expect(isProxy(state)).toBe(true);
        expect(isProxy(state.rnFile)).toBe(false);
    }));

    it("should only be updateable through update method", createTest(() => {

		const { state, update } = createState(getInitialData());

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
	}));

	it("should block defining prototype", createTest(() => {
		const { state, update } = createState(getInitialData());

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
	}));

	it("should block setPrototypeOf", createTest(() => {
		const { state, update } = createState(getInitialData());

		expect(() => {
			Object.setPrototypeOf(state, {});
		}).toThrow();

		expect(() => {
			update((obj) => {
				Object.setPrototypeOf(state, {});
			});
		}).toThrow();
	}));

	it("should throw on double update", createTest(() => {
		const { update } = createState(getInitialData());

		expect(() => {
			update(() => {
				update();
			});
		}).toThrow();
	}));

	it("should proxy new object trees added with update", createTest(() => {

		const { state, update } = createState(getInitialData());

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
	}));

	it("should not proxy in production", createTest(() => {

		const initial = getInitialData();
		const { state, update } = createState(initial);

		expect(state).toBe(initial);

		const state1 = update((obj) => {
			obj.arr.push(4);
		});

		expect(state1).toBe(state);
		expect(state1.arr).toHaveLength(4);
	}, true));

	it("should proxy object with symbol prop", createTest(() => {
		const sym = Symbol.for("test-sym");

		const { state } = createState({
			foo: "bar",
			[sym]: true
		});

		expect(state[sym]).toBe(true);
	}));

	//TODO: uncomment when this is supported
	// it("should work for existing prop proxy", createTest(() => {
	// 	const { state: child } = createState(getInitialData());
	//
	// 	const { state: parent, update } = createState({
	// 		test: true,
	// 	});
	//
	// 	update((stt) => {
	// 		stt.child = child;
	// 	});
	//
	// 	expect(parent.child.children).toHaveLength(2);
	//
	// 	update((stt) => {
	// 		stt.child.children.push({complex: true});
	// 	});
	//
	// 	expect(parent.child.children).toHaveLength(3);
	// }));

	describe("unwrap tests", () => {
		it("should unwrap to same object in production", createTest(() => {
			process.env.NODE_ENV = "production";

			const initial = getInitialData();
			const { unwrap } = createState(initial);

			const org = unwrap();
			expect(org).toBe(initial);
		}, true));

		it("unwrap export should return same object in production", createTest(() => {

			process.env.NODE_ENV = "production";

			const { state } = createState(getInitialData());

			const children = unwrap(state.children);

			expect(children).toBe(state.children);
		}, true));

		it("should unwrap entry", createTest(() => {
			const initial = getInitialData();
			const { state, unwrap } = createState(initial);

			clone.mockReturnValueOnce("clone");
			const unwrapResult = unwrap(state);

			expect(unwrapResult).toBe("clone");
		}));

		it("should do nothing for non-proxy", createTest(() => {
			const obj = { test: true };
			const result = unwrap(obj);
			expect(result).toBe(obj);
		}));

		it("unwrap export should clone", createTest(() => {
			const initial = getInitialData();
			const { state } = createState(initial);

			clone.mockReturnValueOnce("clone");

			const children = unwrap(state.children);
			expect(children).toBe("clone");
		}));

		it("should work for exiting proxy", createTest(() => {
			const { state } = createState(getInitialData());
			const { state: state2, update } = createState(state);

			update((st) => {
				st.children.push({ reproxy: true });
			});

			expect(state2.children).toHaveLength(3);
			expect(state.children).toHaveLength(3);
		}));
	});
});
