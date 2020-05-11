import { createBatchItem, triggerUpdater, utils } from "@rpldy/shared/src/tests/mocks/rpldy-shared.mock";
import xhrSend from "@rpldy/sender";
import ChunkedSendError from "../ChunkedSendError";
import { getChunkDataFromFile } from "../../utils";
import { CHUNK_EVENTS } from "../../consts";
import sendChunk from "../sendChunk";

jest.mock("@rpldy/sender", () => jest.fn());
jest.mock("../../utils", () => ({ getChunkDataFromFile: jest.fn() }));

describe("sendChunk tests", () => {

    const xhrSendResult = { request: Promise.resolve({ xhrSend: true }), abort: jest.fn() };

    const onProgress = jest.fn();

    beforeEach(() => {
        clearJestMocks(
            xhrSend,
            onProgress,
            triggerUpdater,
            xhrSendResult.abort,
        );
    });

    const testSendChunk =  async (data, chunkStartData = {}) => {
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

        triggerUpdater.mockResolvedValueOnce(chunkStartData);
        createBatchItem.mockReturnValueOnce(chunkItem);
        xhrSend.mockResolvedValueOnce(xhrSendResult);

        const sendResult = sendChunk(chunk, { file }, url, sendOptions, onProgress, trigger);

        const result = await sendResult.request;

        expect(result).toEqual({ xhrSend: true });

        if (!data) {
            expect(getChunkDataFromFile).toHaveBeenCalledWith(file, chunk.start, chunk.end);
        }

        expect(createBatchItem).toHaveBeenCalledWith(fileData, "c1");

        const updatedSendOptions = {
            ...sendOptions,
            headers: {
                ...sendOptions.headers,
                "Content-Range": `bytes 1-${fileData.size}/400`,
            }
        };

        expect(xhrSend).toHaveBeenCalledWith(
            [chunkItem],
            chunkStartData.url || url,
            utils.merge({}, updatedSendOptions, chunkStartData.sendOptions),
            expect.any(Function)
        );

        const progressEvent = { loaded: 123 };
        xhrSend.mock.calls[0][3](progressEvent);
        expect(onProgress).toHaveBeenCalledWith(progressEvent, [{
            ...chunk,
            data: fileData,
        }]);

        expect(triggerUpdater).toHaveBeenCalledWith(trigger, CHUNK_EVENTS.CHUNK_START, {
            item: { file },
            chunk: {
                id: chunk.id,
                start: chunk.start,
                end: chunk.end
            },
            sendOptions: updatedSendOptions,
            url,
        });
    };

	it.each([
		null,
		{size: 9},
	])("should send chunk with data = %s", async (data) => {
       await testSendChunk(data);
	});

    it("should use updated values from chunk start event updater", async () => {
        await testSendChunk({size: 9}, {
            url: "updated.com",
            sendOptions: {
                headers: {
                    "another": true
                }
            },
        });

        expect(xhrSend.mock.calls[0][1]).toBe("updated.com");
        expect(xhrSend.mock.calls[0][2].headers.another).toBe(true);
    });

    it("should throw if failed to slice chunk", () => {

        getChunkDataFromFile.mockReturnValueOnce(null);
        const chunk = { id: "c1", start: 1, end: 10, data: null };

        expect(() => {
            sendChunk(chunk, { file: {} }, "url", {});
        }).toThrow(ChunkedSendError);
    });

    describe("abort tests", () => {
        const url = "test.com",
            data = {size: 9},
            chunk = { id: "c1", start: 1, end: 10, data },
            file = { size: 400 },
            sendOptions = { method: "POST", headers: { "x-test": 123 } };

        it("should call abort successfully - before request is used", async () => {

            xhrSend.mockResolvedValueOnce(xhrSendResult);

            triggerUpdater
                .mockResolvedValueOnce({ });

            const sendResult = sendChunk(chunk, { file }, url, sendOptions, onProgress);

            await sendResult.abort();

            await sendResult.request;

            expect(xhrSend).toHaveBeenCalledTimes(1);
            expect(xhrSendResult.abort).toHaveBeenCalledTimes(1);
        });

        it("should call abort successfully - after request is used", async() => {

            xhrSend.mockResolvedValueOnce(xhrSendResult);

            triggerUpdater
                .mockResolvedValueOnce({ });

            const sendResult = sendChunk(chunk, { file }, url, sendOptions, onProgress);

            await sendResult.request;
            await sendResult.abort();
            expect(xhrSend).toHaveBeenCalledTimes(1);
            expect(xhrSendResult.abort).toHaveBeenCalledTimes(1);
        });
    });
});
