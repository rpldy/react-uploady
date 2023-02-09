import createItem from "../batchItem";
import { FILE_STATES } from "../consts";

describe("create batchItem tests", () => {
    it("should create batch item with file", () => {
        const file = { name: "test", type: "image/jpg" };

        const fileItem = createItem(file, "b1");

        expect(fileItem.file).toBe(file);
        expect(fileItem.url).toBeUndefined();
        expect(fileItem.batchId).toBe("b1");
        expect(fileItem.id).toBeDefined();
        expect(fileItem.state).toBe(FILE_STATES.ADDED);

        const fileItem2 = createItem({ name: "test2", type: "image/jpg"  }, "b1");
        expect(fileItem2.id).toBeDefined();
        expect(fileItem2.id).not.toBe(fileItem.id);
    });

    it("should create batch item for blob", () => {
        const file = new Blob([1], { type: "image/jpg" });
        const fileItem = createItem(file, "b1");

        expect(fileItem.file).toBe(file);
        expect(fileItem.url).toBeUndefined();
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

	it("should recycle file batch item", () => {
		const file = { name: "test", type: "image/jpg"};
		const fileItem = createItem(file, "b1");

		fileItem.state = "DONE";
		fileItem.completed = 100;
		fileItem.loaded = 1000;

		const recycled = createItem(fileItem, "b2");

		expect(recycled.id).toBe(fileItem.id);
		expect(recycled.state).toBe(FILE_STATES.ADDED);
		expect(recycled.completed).toBe(0);
		expect(recycled.loaded).toBe(0);
		expect(recycled.file).toEqual(file);
	});

	it("should recycle url batch item", () => {
		const fileItem = createItem( "file.com", "b1");

		fileItem.state = "DONE";
		fileItem.completed = 100;
		fileItem.loaded = 1000;

		const recycled = createItem(fileItem, "b2");

		expect(recycled.id).toBe(fileItem.id);
		expect(recycled.state).toBe(FILE_STATES.ADDED);
		expect(recycled.completed).toBe(0);
		expect(recycled.loaded).toBe(0);
		expect(recycled.url).toBe("file.com");
	});

    it("should create pending batch item", () => {
        const file = { name: "test", type: "image/jpg" };
        const fileItem = createItem(file, "b1", true);

        expect(fileItem.state).toBe(FILE_STATES.PENDING);
    });
});
