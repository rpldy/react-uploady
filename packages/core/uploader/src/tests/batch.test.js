import { BATCH_STATES, createBatchItem } from "@rpldy/shared/src/tests/mocks/rpldy-shared.mock";
import createBatch from "../batch";

describe("Batch tests", () => {

    beforeEach(() => {
        clearJestMocks(
            createBatchItem,
        );
    });

    it("should create new batch", () => {
        createBatchItem
            .mockReturnValueOnce("item1")
            .mockReturnValueOnce("item2");

        const files = [
            {},
            "https://url.test"
        ];

        const batch = createBatch(files, "uploader1", { autoUpload: true });

        expect(batch.id).toBeDefined();
        expect(batch.uploaderId).toBe("uploader1");

        expect(batch.items).toHaveLength(2);

        expect(batch.state).toBe(BATCH_STATES.ADDED);

        expect(createBatchItem).toHaveBeenCalledTimes(2);
        expect(createBatchItem).toHaveBeenCalledWith(files[0], expect.any(String), false);
        expect(createBatchItem).toHaveBeenCalledWith(files[1], expect.any(String), false);
    });

    it("should create new pending batch", () => {
        const batch = createBatch([], "uploader1", { autoUpload: false });
        expect(batch.state).toBe(BATCH_STATES.PENDING);
    });

    it("should work with file list", () => {
        const input = document.createElement("input");
        input.type = "file";

        const batch = createBatch(input.files, "uploader1", { autoUpload: true });

        expect(batch.id).toBeDefined();
        expect(batch.uploaderId).toBe("uploader1");
        expect(batch.state).toBe(BATCH_STATES.ADDED);
        expect(batch.items).toHaveLength(0);
    });

    it("should work with single file", () => {
        const file = { file: true };
        const batch = createBatch(file, "uploader1", {});

        expect(batch.id).toBeDefined();
        expect(batch.uploaderId).toBe("uploader1");
        expect(batch.items).toHaveLength(1);

        expect(createBatchItem).toHaveBeenCalledWith(file, expect.any(String), true);
    });

    it("should use options file filter", () => {
        const files = [
            {},
            "https://url.test",
            "https://url2.test"
        ];

        const batch = createBatch(files, "uploader1", {
            fileFilter: (file) => typeof file !== "string"
        });

        expect(batch.items).toHaveLength(1);
    });
});
