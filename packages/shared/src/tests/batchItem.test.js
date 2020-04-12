import createItem from "../batchItem";
import { FILE_STATES } from "../consts";

describe("create batchItem tests", () => {

	it("should create batch item with file", () => {
		const file = {name: "test"};

		const fileItem = createItem(file, "b1");

		expect(fileItem.file).toBe(file);
		expect(fileItem.url).toBeUndefined();
		expect(fileItem.batchId).toBe("b1");
		expect(fileItem.id).toBeDefined();
		expect(fileItem.state).toBe(FILE_STATES.ADDED);

		const fileItem2 = createItem({name: "test2"}, "b1");
		expect(fileItem2.id).not.toBe(fileItem.id);
	});

	it("should create batch item with url", () => {

		const url = "test";

		const fileItem = createItem(url, "b1");

		expect(fileItem.url).toBe(url);
		expect(fileItem.file).toBeUndefined();
		expect(fileItem.batchId).toBe("b1");
		expect(fileItem.id).toBeDefined();
		expect(fileItem.state).toBe(FILE_STATES.ADDED);
	});

	it("should throw on unknown info type", () => {
		expect(() => {
			createItem(() => {
			});
		}).toThrow();
	});

});
