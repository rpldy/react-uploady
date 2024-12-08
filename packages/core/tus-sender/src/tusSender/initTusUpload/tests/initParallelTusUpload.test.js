import createTusState from "../../../tests/tusState.mock";
import { createChunkedSender, getChunkDataFromFile } from "@rpldy/chunked-sender";
import { createResumeSuccessResult, getHeadersWithoutContentRange } from "../../utils";
import { retrieveResumable } from "../../../resumableStore";
import handleParallelTusUpload from "../../handleParallelTusUpload";
import initTusUpload from "../initTusUpload";
import resumeUpload from "../resumeUpload";
import initParallelTusUpload from "../initParallelTusUpload";
import { FILE_STATES } from "@rpldy/shared";

vi.mock("@rpldy/chunked-sender");
vi.mock("../../utils");
vi.mock("../../../resumableStore");
vi.mock("../../handleParallelTusUpload");
vi.mock("../resumeUpload");
vi.mock("../initTusUpload");

describe("initParallelTusUpload tests", () => {
    const getAbortFn = () => vi.fn();
    const sendOptions = { params: "123" };
    const chunkSender = { send: "send" };

    beforeAll(() => {
        getChunkDataFromFile.mockReturnValue(new Blob(["a"]));
        createChunkedSender.mockReturnValue(chunkSender);
    });

    beforeEach(() => {
        clearViMocks(
            resumeUpload,
            initTusUpload,
            retrieveResumable,
            createResumeSuccessResult,
            getHeadersWithoutContentRange,
            createChunkedSender,
            getChunkDataFromFile,
            handleParallelTusUpload,
        );
    });

    it("should init parallel upload", () => {
        const item = { id: "i1", file: { size: 220_000 } };
        const tusState = createTusState({ items: {}, options: { parallel: 2, chunkSize: 50_000 } });

        initTusUpload
            .mockReturnValueOnce({ request: Promise.resolve({}), abort: getAbortFn() })
            .mockReturnValueOnce({ request: Promise.resolve({}), abort: getAbortFn() });

        initParallelTusUpload([item], "url", sendOptions, "onProgress", tusState, "trigger");

        const state = tusState.getState();

        expect(state.items[item.id]).toBeDefined();
        expect(state.items[item.id].parallelParts).toHaveLength(2);

        const pPart1 = state.items[item.id].parallelParts[0];
        expect(pPart1.identifier).toBe("prll_2_p0");
        expect(pPart1.item).toBeDefined();
        expect(pPart1.start).toBe(0);
        expect(pPart1.end).toBe(110_000);
        expect(pPart1.orgItemId).toBe("i1");

        const pPart2 = state.items[item.id].parallelParts[1];
        expect(pPart2.identifier).toBe("prll_2_p1");
        expect(pPart2.item).toBeDefined();
        expect(pPart2.start).toBe(110_000);
        expect(pPart2.end).toBe(220_000);
        expect(pPart1.orgItemId).toBe("i1");

        expect(handleParallelTusUpload).toHaveBeenCalledWith(item, "url", tusState, sendOptions, expect.any(Promise));

        expect(initTusUpload).toHaveBeenCalledTimes(2);

        expect(initTusUpload).toHaveBeenNthCalledWith(1, [pPart1.item], "url", expect.objectContaining({
            headers: undefined,
            params: null
        }), "onProgress", tusState, chunkSender, "trigger", pPart1.identifier, pPart1.orgItemId);

        expect(initTusUpload).toHaveBeenNthCalledWith(2, [pPart2.item], "url", expect.objectContaining({
            headers: undefined,
            params: null
        }), "onProgress", tusState, chunkSender, "trigger", pPart2.identifier, pPart2.orgItemId);
    });

    it.each([
        ["success", FILE_STATES.FINISHED],
        ["fail", FILE_STATES.ERROR],
        ["fail", FILE_STATES.ABORTED]
    ])("should handle %s init for part with state: %s",
        async (response, state) => {
            const item = { id: "i1", file: { size: 220_000 } };
            const tusState = createTusState({ items: {}, options: { parallel: 2, chunkSize: 50_000 } });

            initTusUpload
                .mockReturnValueOnce({
                    request: Promise.resolve({
                        state: FILE_STATES.FINISHED,
                        status: 0,
                        response: "success"
                    }), abort: getAbortFn()
                })
                .mockReturnValueOnce({
                    request: Promise.resolve({
                        state,
                        status: 0,
                        response
                    }), abort: getAbortFn()
                });

            initParallelTusUpload([item], "url", sendOptions, "onProgress", tusState, "trigger");

            const handleParallelRequest = handleParallelTusUpload.mock.calls[0][4];
            const result = await handleParallelRequest;

            expect(result).toEqual({
                status: 0,
                state,
                response,
            });
        });

    it("should init parallel with already persisted url - resume success", async () => {
        const item = { id: "i1", file: { size: 220_000 } };
        const tusState = createTusState({ items: {}, options: { parallel: 2, chunkSize: 50_000 } });

        retrieveResumable.mockReturnValueOnce("persisted");
        resumeUpload.mockReturnValueOnce({
            request: Promise.resolve({ isDone: true, uploadUrl: "uploadUrl" }),
            abort: getAbortFn(),
        });

        createResumeSuccessResult.mockReturnValueOnce("resumeSuccess");

        const { request } = initParallelTusUpload([item], "url", sendOptions, "onProgress", tusState, "trigger");

        expect(resumeUpload).toHaveBeenCalledWith(item, "persisted", tusState, "trigger");

        const result = await request;

        expect(result).toBe("resumeSuccess");
    });

    it("should init parallel with already persisted url - resume fail", async () => {
        const item = { id: "i1", file: { size: 220_000 } };
        const tusState = createTusState({ items: {}, options: { parallel: 2, chunkSize: 50_000 } });

        retrieveResumable.mockReturnValueOnce("persisted");

        resumeUpload.mockReturnValueOnce({
            request: Promise.resolve(undefined),
            abort: getAbortFn()
        });

        initTusUpload
            .mockReturnValueOnce({ request: Promise.resolve({}), abort: getAbortFn() })
            .mockReturnValueOnce({ request: Promise.resolve({}), abort: getAbortFn() });

        const { request } = initParallelTusUpload([item], "url", sendOptions, "onProgress", tusState, "trigger");

        await request;

        expect(initTusUpload).toHaveBeenCalledTimes(2);
    });

    it("should abort resume request", () => {
        const item = { id: "i1", file: { size: 220_000 } };
        const tusState = createTusState({ items: {}, options: { parallel: 2, chunkSize: 50_000 } });

        retrieveResumable.mockReturnValueOnce("persisted");

        const resumeAbort = getAbortFn();

        resumeUpload.mockReturnValueOnce({
            request: Promise.resolve({ isDone: true }),
            abort: resumeAbort,
        });

        const { abort } = initParallelTusUpload([item], "url", sendOptions, "onProgress", tusState, "trigger");

        abort();

        expect(resumeAbort).toHaveBeenCalled();
    });

    it("should abort parallel part requests", () => {
        const item = { id: "i1", file: { size: 220_000 } };
        const tusState = createTusState({ items: {}, options: { parallel: 2, chunkSize: 50_000 } });

        const partsAborts = [getAbortFn(), getAbortFn()];

        initTusUpload
            .mockReturnValueOnce({ request: Promise.resolve({}), abort: partsAborts[0] })
            .mockReturnValueOnce({ request: Promise.resolve({}), abort: partsAborts[1] });

        const { abort } = initParallelTusUpload([item], "url", sendOptions, "onProgress", tusState, "trigger");

        abort();

        expect(partsAborts[0]).toHaveBeenCalled();
        expect(partsAborts[1]).toHaveBeenCalled();
    });

    it("should abort parallel requests after resume failed", async () => {
        const item = { id: "i1", file: { size: 220_000 } };
        const tusState = createTusState({ items: {}, options: { parallel: 2, chunkSize: 50_000 } });

        retrieveResumable.mockReturnValueOnce("persisted");

        const resumeAbort = getAbortFn();

        resumeUpload.mockReturnValueOnce({
            request: Promise.resolve({ isDone: false }),
            abort: resumeAbort,
        });

        const partsAborts = [getAbortFn(), getAbortFn()];

        initTusUpload
            .mockReturnValueOnce({ request: Promise.resolve({}), abort: partsAborts[0] })
            .mockReturnValueOnce({ request: Promise.resolve({}), abort: partsAborts[1] });

        const { abort, request } = initParallelTusUpload([item], "url", sendOptions, "onProgress", tusState, "trigger");

        await request;

        abort();

        expect(resumeAbort).toHaveBeenCalled();
        expect(partsAborts[0]).toHaveBeenCalled();
        expect(partsAborts[1]).toHaveBeenCalled();
    });
});
