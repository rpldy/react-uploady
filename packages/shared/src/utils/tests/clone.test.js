import clone from "../clone";

describe("clone (deep) tests", () => {

    it("should return new object with all enumerable props in all levels", () => {

        const obj = {
            a: "b",
            level2: {
                b: "c",
            },
            level2_1: {
                c: "d"
            },
            d: "e",
            e: undefined,
        };

        const result = clone(obj);

        expect(result).not.toBe(obj);
        expect(result).toEqual(obj);
    });

	it("should clone array", () => {

		const arr = [1,2,3];
		const arr2 = clone(arr);

		expect(arr).not.toBe(arr2);

		arr.push(4);
		expect(arr2).toHaveLength(3);
	});

	it("should clone array with objects", () => {
		const arr = [{name: "a"}, {name: "b"}];
		const arr2 = clone(arr);

		arr[1].name = "c";
		expect(arr2[1].name).toBe("b");

		arr2.push({name: "d"});
		expect(arr).toHaveLength(2);
		expect(arr2).toHaveLength(3);

		arr2[1].test = true;
		arr2[2].test = true;

		expect(arr[1].test).toBeUndefined();
		expect(arr2[1].test).toBe(true);
		expect(arr2[2].test).toBe(true);
	});

	it("should do nothing for simple values ", () => {
		const str = clone("test");
		expect(str).toBe("test");

		const num = clone(4);
		expect(num).toBe(4);
	});

	it("should use merge fn", () => {
		const merge = jest.fn();
		const obj = { test: true };
		clone(obj, merge);

		expect(merge).toHaveBeenCalledWith({}, obj);
	});
});
