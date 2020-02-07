import { createBatchItem } from "@rpldy/shared/src/tests/mocks/rpldy-shared.mock";
import send from "@rpldy/sender";
import { getChunkDataFromFile } from "../../utils";
import sendChunk from "../sendChunk";

jest.mock("@rpldy/sender", () => jest.fn());
jest.mock("../../utils", () => ({ getChunkDataFromFile: jest.fn() }));

describe("sendChunk tests", () => {

	it.each([
		null,
		{},
	])("should send chunk with data = %s", (data) => {
		const url = "test.com",
			chunk = { id: "c1", start: 1, end: 10, data },
			fileData = data || {size: 10},
			file = { size: 400 },
			chunkItem = {},
			sendOptions = { method: "POST", headers: { "x-test": 123 } },
			onProgress = {};

		if (!data) {
			getChunkDataFromFile.mockReturnValueOnce(fileData);
		}

		createBatchItem.mockReturnValueOnce(chunkItem);

		sendChunk(chunk, { file }, url, sendOptions, onProgress);

		expect(getChunkDataFromFile).toHaveBeenCalledWith(file, chunk.start, chunk.end);
		expect(createBatchItem).toHaveBeenCalledWith(fileData, "c1");

		expect(send).toHaveBeenCalledWith(
			[chunkItem],
			url,
			{
				...sendOptions,
				headers: {
					...sendOptions.headers,
					"Content-Range": "bytes 1-10/400",
				}
			}, onProgress);
	});

});