import getChunks from "../getChunks";
import ChunkedSendError from "../ChunkedSendError";

describe("getChunks tests", () => {

    it("should return chunks for file", () => {

        const chunks = getChunks(
            { id: "bi1", file: { size: 999 } },
            { chunkSize: 201 });

        expect(chunks).toHaveLength(5);

        expect(chunks[0].start).toBe(0);
        expect(chunks[0].end).toBe(201);
        expect(chunks[0].id).toBe("bi1_chunk-0");

        expect(chunks[1].start).toBe(201);
        expect(chunks[1].end).toBe(402);

        expect(chunks[2].start).toBe(402);
        expect(chunks[2].end).toBe(603);

        expect(chunks[3].start).toBe(603);
        expect(chunks[3].end).toBe(804);

        expect(chunks[4].start).toBe(804);
        expect(chunks[4].end).toBe(999);
        expect(chunks[4].id).toBe("bi1_chunk-4");
    });

    it("should return one chunk if file smaller than chunk size", () => {

        const chunks = getChunks(
            { id: "bi1", file: { size: 499 } },
            { chunkSize: 500 });

        expect(chunks).toHaveLength(1);

        expect(chunks[0].start).toBe(0);
        expect(chunks[0].end).toBe(499);
        expect(chunks[0].id).toBe("bi1_chunk-0");
    });

    it("should return one chunk if file equal to chunk size", () => {
        const chunks = getChunks(
            { id: "bi1", file: { size: 500 } },
            { chunkSize: 500 });

        expect(chunks).toHaveLength(1);

        expect(chunks[0].start).toBe(0);
        expect(chunks[0].end).toBe(500);
        expect(chunks[0].id).toBe("bi1_chunk-0");
    });

    it("should start from startByte", () => {
        const chunks = getChunks(
            { id: "bi1", file: { size: 500 } },
            { chunkSize: 100 }, 100);

        expect(chunks).toHaveLength(4);
        expect(chunks[0].start).toBe(100);
        expect(chunks[0].end).toBe(200);
    });

    it("should return one chunk for startByte", () => {
        const chunks = getChunks(
            { id: "bi1", file: { size: 500 } },
            { chunkSize: 100 }, 401
        );

        expect(chunks).toHaveLength(1);

        expect(chunks[0].start).toBe(401);
        expect(chunks[0].end).toBe(500);
    });

    it("should throw if startByte is equal to file size", () => {
        expect(() => {
            getChunks({ id: "bi1", file: { size: 500 } },
                { chunkSize: 100 }, 500);
        }).toThrow(ChunkedSendError);
    });

    it("should throw if startByte is larger than file size", () => {
        expect(() => {
            getChunks({ id: "bi1", file: { size: 500 } },
                { chunkSize: 100 }, 501);
        }).toThrow(ChunkedSendError);
    });
});
