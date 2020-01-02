
import createBatch from "../batch";
import { BATCH_STATES, FILE_STATES } from "@rpldy/shared";

describe("Batch tests", () => {

	it("should create new batch", () => {

		const files = [
			{},
			"https://url.test"
		];

		const batch = createBatch(files, "uploader1");

		expect(batch.id).toBeDefined();
		expect(batch.uploaderId).toBe("uploader1");

		expect(batch.state).toBe(BATCH_STATES.ADDED);

		expect(batch.items[0].id).toBeDefined();
		expect(batch.items[1].id).toBeDefined();

		expect(batch.items[0].batchId).toBe(batch.id);
		expect(batch.items[1].batchId).toBe(batch.id);

		expect(batch.items[0].state).toBe(FILE_STATES.ADDED);
		expect(batch.items[1].state).toBe(FILE_STATES.ADDED);

		expect(batch.items[0].file).toBe(files[0]);
		expect(batch.items[1].url).toBe(files[1]);
	});

	it("should throw for unknown file type", () => {

		expect(()=>{
			createBatch([()=>{}], "fail");
		}).toThrow("Unknown type of file added: function")

	});
});