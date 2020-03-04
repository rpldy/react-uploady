import ChunkedSendError from "../ChunkedSendError";
import handleChunkRequest from "../handleChunkRequest";
import getChunksToSend from "../getChunksToSend";
import sendChunk from "../sendChunk";
import sendChunks, { handleChunk } from "../sendChunks";
import { FILE_STATES } from "@rpldy/shared";

jest.mock("../handleChunkRequest", () => jest.fn());
jest.mock("../getChunksToSend", () => jest.fn());
jest.mock("../sendChunk", () => jest.fn());

describe("sendChunks tests", () => {

    beforeEach(() => {
        clearJestMocks(
            handleChunkRequest,
            getChunksToSend,
            sendChunk,
        )
    });

    it("should do nothing if finished", () => {
        sendChunks({ finished: true });
        expect(getChunksToSend).not.toHaveBeenCalled();
    });

    it("should do nothing if aborted", () => {
        sendChunks({ aborted: true });
        expect(getChunksToSend).not.toHaveBeenCalled();
    });

    it("should do nothing if parallel not allowed", () => {
        sendChunks({ requests: { c1: {} }, parallel: 1 });
        expect(getChunksToSend).not.toHaveBeenCalled();
    });

    it("should resolve with chunk failed error", () => {

        getChunksToSend.mockImplementationOnce(() => {
            throw new ChunkedSendError();
        });

        const resolve = jest.fn();

        sendChunks({ requests: {} }, null, null, resolve);

        expect(resolve).toHaveBeenCalledWith({
            state: FILE_STATES.ERROR,
            response: "At least one chunk failed"
        });
    });

    it("should resolve with unknown error", () => {
        getChunksToSend.mockImplementationOnce(() => {
            throw new Error("test");
        });

        const resolve = jest.fn();

        sendChunks({ requests: {} }, null, null, resolve);

        expect(resolve).toHaveBeenCalledWith({
            state: FILE_STATES.ERROR,
            response: "test"
        });
    });

    describe("chunks being sent tests", () => {

        const doSend = async (chunks, state = {}, resolve) => {
            const item = {},
                sendOptions = {},
                onProgress = "progress";

            getChunksToSend.mockReturnValueOnce(chunks);

            const noop = () => {};
            resolve = resolve || noop;

            state = {
                chunks: [],
                requests: {},
                url: "test.com",
                sendOptions,
                ...state,
            };

            await sendChunks(state, item, onProgress, resolve);

            return { state, item, onProgress };
        };

        it("should send chunk when no in progress", async () => {
            const chunk = {};
            const { state, item, onProgress } = await doSend([chunk]);
            expect(sendChunk).toHaveBeenCalledWith(chunk, item, "test.com", state.sendOptions, onProgress);
        });

        it("should send chunk when parallel allowed", async() => {
            const chunk = {};
            const { state, item, onProgress } = await doSend([chunk], {
                requests: { c1: {} },
                parallel: 2
            });
            expect(sendChunk).toHaveBeenCalledWith(chunk, item, "test.com", state.sendOptions, onProgress);
        });

        it("should send chunk if parallel allowed", async () => {
            const chunk = {}, chunk2 = {};
            const { state, item, onProgress } = await doSend([chunk, chunk2], {
                requests: { c1: {} },
                parallel: 2
            });
            expect(sendChunk).toHaveBeenCalledWith(chunk, item, "test.com", state.sendOptions, onProgress);
            expect(sendChunk).toHaveBeenCalledWith(chunk2, item, "test.com", state.sendOptions, onProgress);
        });

        it("should resolve with chunk failed error in case sendChunk throws", async () => {
            sendChunk.mockImplementationOnce(() => {
                throw new ChunkedSendError();
            });

            const resolve = jest.fn();

            await doSend([1,2,3], {}, resolve);

            expect(resolve).toHaveBeenCalledWith({
                state: FILE_STATES.ERROR,
                response: "At least one chunk failed"
            });

            expect(resolve).toHaveBeenCalledTimes(1);
        });
    });

    describe("handleChunk tests", () => {

        it("should handle chunk and finish", async () => {
            const result = {};
            sendChunk.mockReturnValueOnce(result);
            handleChunkRequest.mockResolvedValueOnce();

            const state = {
                chunks: [],
                responses: [],
            };

            const chunkId = "c1";

            const resolve = jest.fn();
            await handleChunk(state, {}, {}, resolve, { id: chunkId });

            expect(handleChunkRequest).toHaveBeenCalledWith(state, chunkId, result);

            expect(state.finished).toBe(true);

            expect(resolve).toHaveBeenCalledWith({
                state: FILE_STATES.FINISHED,
                response: state.responses,
            });

            expect(getChunksToSend).not.toHaveBeenCalled();
        });

        it("should handle chunk and send more", async () => {

            handleChunkRequest.mockResolvedValueOnce();

            const state = {
                requests: {},
                chunks: [1, 2],
            };

            const resolve = jest.fn();
            await handleChunk(state, {}, {}, resolve, { id: "c1" });

            expect(state.finished).toBeFalsy();
            expect(resolve).not.toHaveBeenCalled();
            expect(getChunksToSend).toHaveBeenCalledWith(state);
            expect(sendChunk).toHaveBeenCalledTimes(1);
        });
    });
});

