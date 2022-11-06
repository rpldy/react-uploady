import { BATCH_STATES, createBatchItem, getIsBatchItem } from "@rpldy/shared/src/tests/mocks/rpldy-shared.mock";
import createBatch from "../batch";

describe("Batch tests", () => {

    beforeEach(() => {
        clearJestMocks(
            createBatchItem,
            getIsBatchItem,
        );
    });

    it("should create new batch", async () => {
        createBatchItem
            .mockReturnValueOnce("item1")
            .mockReturnValueOnce("item2");

        const files = [
            {},
            "https://url.test"
        ];

        const batch = await createBatch(files, "uploader1", { autoUpload: true });

        expect(batch.id).toBeDefined();
        expect(batch.uploaderId).toBe("uploader1");

        expect(batch.items).toHaveLength(2);

        expect(batch.state).toBe(BATCH_STATES.ADDED);

        expect(createBatchItem).toHaveBeenCalledTimes(2);
        expect(createBatchItem).toHaveBeenCalledWith(files[0], expect.any(String), false);
        expect(createBatchItem).toHaveBeenCalledWith(files[1], expect.any(String), false);
    });

    it("should create new pending batch", async () => {
        const batch = await createBatch([], "uploader1", { autoUpload: false });
        expect(batch.state).toBe(BATCH_STATES.PENDING);
    });

    it("should work with file list", async () => {
        const input = document.createElement("input");
        input.type = "file";

        const batch = await createBatch(input.files, "uploader1", { autoUpload: true });

        expect(batch.id).toBeDefined();
        expect(batch.uploaderId).toBe("uploader1");
        expect(batch.state).toBe(BATCH_STATES.ADDED);
        expect(batch.items).toHaveLength(0);
    });

    it("should work with single file", async () => {
        const file = { file: true };
        const batch = await createBatch(file, "uploader1", {});

        expect(batch.id).toBeDefined();
        expect(batch.uploaderId).toBe("uploader1");
        expect(batch.items).toHaveLength(1);

        expect(createBatchItem).toHaveBeenCalledWith(file, expect.any(String), true);
    });

    it("should use options file filter", async () => {
        const files = [
            {},
            "https://url.test",
            "https://url2.test"
        ];

        const batch = await createBatch(files, "uploader1", {
            fileFilter: (file) => typeof file !== "string"
        });

        expect(batch.items).toHaveLength(1);
    });

    it("should work with async file filter and falsy/truthy values", async () => {
        const filter = jest.fn();

        filter
            .mockReturnValueOnce(false)
            .mockReturnValueOnce(undefined)
            .mockResolvedValueOnce("")
            .mockResolvedValueOnce(1)
            .mockResolvedValueOnce(null)
            .mockReturnValueOnce("true");

        const files = [
            { name: "1" },
            { name: "2" },
            { name: "3" },
            { name: "4" },
            { name: "5" },
            { name: "6" },
        ];

        const batch = await createBatch(files, "u1", {
            fileFilter: filter,
        });

        expect(batch.items).toHaveLength(2);

        expect(createBatchItem).toHaveBeenCalledTimes(2);
        expect(createBatchItem).toHaveBeenNthCalledWith(1, files[3], expect.any(String), true);
    });

    it("should reject on async file filter error", async () => {
        const badFilter = () => {
            return new Promise(() => {
                throw new Error("ERROR");
            });
        };

        await expect(createBatch([{}], "u1", { fileFilter: badFilter }))
            .rejects.toThrow("ERROR");
    });

    it("should create new batch from existing batch items (retry)", async () => {
        const files = [
            { file: { name: "test"} },
            { url: "https://url.test" }
        ];

        const fileFilter = jest.fn(() => true);

        createBatchItem
            .mockReturnValueOnce("item1")
            .mockReturnValueOnce("item2");

        getIsBatchItem
            .mockReturnValueOnce(true)
            .mockReturnValueOnce(true);

        const batch = await createBatch(files, "uploader1", { autoUpload: true, fileFilter });

        expect(batch.items).toHaveLength(2);

        expect(fileFilter).toHaveBeenNthCalledWith(1, files[0].file);
        expect(fileFilter).toHaveBeenNthCalledWith(2, files[1].url);
    });
});
