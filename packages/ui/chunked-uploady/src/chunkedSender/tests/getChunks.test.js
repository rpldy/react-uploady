import getChunks from "../getChunks";

describe("getChunks tests", () => {

	it("should return chunks for file", () => {

		const chunks = getChunks(
			{ id: "bi1", file: { size: 999 } },
			{ chunkSize: 201 });

		expect(chunks.length).toBe(5);

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

		expect(chunks.length).toBe(1);

		expect(chunks[0].start).toBe(0);
		expect(chunks[0].end).toBe(499);
		expect(chunks[0].id).toBe("bi1_chunk-0");
	});

});