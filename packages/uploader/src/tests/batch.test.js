
import { BATCH_STATES, createBatchItem } from "@rpldy/shared/src/tests/mocks/rpldy-shared.mock";
import createBatch from "../batch";

describe("Batch tests", () => {

	it("should create new batch", () => {
		createBatchItem
			.mockReturnValueOnce("item1")
			.mockReturnValueOnce("item2");

		const files = [
			{},
			"https://url.test"
		];

		const batch = createBatch(files, "uploader1");

		expect(batch.id).toBeDefined();
		expect(batch.uploaderId).toBe("uploader1");

		expect(batch.state).toBe(BATCH_STATES.ADDED);

		expect(createBatchItem).toHaveBeenCalledTimes(2);
		expect(createBatchItem).toHaveBeenCalledWith(files[0], expect.any(String));
		expect(createBatchItem).toHaveBeenCalledWith(files[1], expect.any(String));
	});
});