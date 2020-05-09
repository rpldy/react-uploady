import { createBatchItem } from "@rpldy/shared/src/tests/mocks/rpldy-shared.mock";
import send from "@rpldy/sender";
import ChunkedSendError from "../ChunkedSendError";
import { getChunkDataFromFile } from "../../utils";
import { CHUNK_EVENTS } from "../../consts";
import sendChunk from "../sendChunk";

jest.mock("@rpldy/sender", () => jest.fn());
jest.mock("../../utils", () => ({ getChunkDataFromFile: jest.fn() }));

describe("sendChunk tests", () => {

    const onProgress = jest.fn();

    beforeEach(() => {
        clearJestMocks(
            send,
            onProgress
        );
    });

	it.each([
		null,
		{size: 9},
	])("should send chunk with data = %s", (data) => {
		const url = "test.com",
			chunk = { id: "c1", start: 1, end: 10, data },
			fileData = data || {size: 10},
			file = { size: 400 },
			chunkItem = {id: "ci-1"},
			sendOptions = { method: "POST", headers: { "x-test": 123 } };

		if (!data) {
			getChunkDataFromFile.mockReturnValueOnce(fileData);
		}

		const trigger = jest.fn();

		createBatchItem.mockReturnValueOnce(chunkItem);
		sendChunk(chunk, { file }, url, sendOptions, onProgress, trigger);

        if (!data) {
            expect(getChunkDataFromFile).toHaveBeenCalledWith(file, chunk.start, chunk.end);
        }

		expect(createBatchItem).toHaveBeenCalledWith(fileData, "c1");

		expect(send).toHaveBeenCalledWith(
			[chunkItem],
			url,
			{
				...sendOptions,
				headers: {
					...sendOptions.headers,
					"Content-Range": `bytes 1-${fileData.size}/400`,
				}
			}, expect.any(Function));

		const progressEvent = {loaded: 123};
		send.mock.calls[0][3](progressEvent);
		expect(onProgress).toHaveBeenCalledWith(progressEvent, [{
		    ...chunk,
            data: fileData,
        }]);

		expect(trigger).toHaveBeenCalledWith(CHUNK_EVENTS.CHUNK_START, {
		    id: chunk.id,
            start: chunk.start,
            end: chunk.end
        });
	});


    it("should throw if failed to slice chunk", () => {

        getChunkDataFromFile.mockReturnValueOnce(null);
        const chunk = { id: "c1", start: 1, end: 10, data: null };

        expect(() => {
            sendChunk(chunk, { file: {} }, "url", {});
        }).toThrow(ChunkedSendError);
    });
});
