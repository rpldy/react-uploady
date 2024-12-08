import createTusState from "../../../tests/tusState.mock";
import { retrieveResumable } from "../../../resumableStore";
import handleTusUpload from "../../handleTusUpload";
import createUpload from "../createUpload";
import resumeUpload from "../resumeUpload";
import initTusUpload from "../initTusUpload";

vi.mock("../../../resumableStore", () => ({
    retrieveResumable: vi.fn(),
}));

vi.mock("../../handleTusUpload");
vi.mock("../createUpload");
vi.mock("../resumeUpload");

describe("initTusUpload tests", () => {
    beforeEach(() => {
        clearViMocks(
            retrieveResumable,
            handleTusUpload,
            createUpload,
            resumeUpload,
        );
    });

    const item = { id: "i1", file: { size: 123 } },
        url = "upload.url",
        sendOptions = { params: "123" },
        onProgress = () => {
        },
        chunkedSender = { send: "send" };

    it("should init single upload - create", () => {
        const tusState = createTusState({
            items: {},
            options: { parallel: 1 }
        });

        createUpload.mockReturnValueOnce({
            request: "request"
        });

        initTusUpload([item], url, sendOptions, onProgress, tusState, chunkedSender);

        expect(tusState.getState().items[item.id].id).toBe(item.id);
        expect(tusState.getState().items[item.id].size).toBe(item.file.size);

        expect(handleTusUpload).toHaveBeenCalledWith(
            [item],
            url,
            sendOptions,
            onProgress,
            tusState,
            chunkedSender,
            "request",
            false,
            null
        );
    });

    it("should init single upload - resume", () => {
        const tusState = createTusState({
            items: {},
            options: { parallel: 1 }
        });

        resumeUpload.mockReturnValueOnce({
            request: "request"
        });

        retrieveResumable.mockReturnValueOnce("stored.url");

        initTusUpload([item], url, sendOptions, onProgress, tusState, chunkedSender, "trigger");

        expect(tusState.getState().items[item.id].id).toBe(item.id);
        expect(tusState.getState().items[item.id].size).toBe(item.file.size);

        expect(resumeUpload).toHaveBeenCalledWith(item, "stored.url", tusState, "trigger", null);

        expect(handleTusUpload).toHaveBeenCalledWith(
            [item],
            url,
            sendOptions,
            onProgress,
            tusState,
            chunkedSender,
            "request",
            true,
            null
        );
    });

    it("should init parallel part", async () => {
        const parallelIdentifier = "pllId2";

        const tusState = createTusState({
            items: {
                "orgItem1": {
                    parallelParts: [
                        {},
                        {
                            identifier: parallelIdentifier,
                            state: "unknown"
                        }
                    ]
                }
            },
            options: { parallel: 1 }
        });

        createUpload.mockReturnValueOnce({
            request: "request"
        });

        initTusUpload([item], url, sendOptions, onProgress, tusState, chunkedSender, "trigger", parallelIdentifier, "orgItem1");

        expect(handleTusUpload).toHaveBeenCalledWith(
            [item],
            url,
            sendOptions,
            onProgress,
            tusState,
            chunkedSender,
            "request",
            false,
            parallelIdentifier
        );
    });

    it("should abort init call and chunked call", async () => {
        const initAbort = vi.fn(),
            chunkedAbort = vi.fn();

        const tusState = createTusState({
            items: {},
            options: {}
        });

        createUpload.mockReturnValue({
            abort: initAbort,
            request: Promise.resolve({})
        });

        const { abort } = initTusUpload([item], url, sendOptions, onProgress, tusState, chunkedSender);

        tusState.updateState((state) => {
            state.items[item.id] = {
                abort: chunkedAbort
            };
        });

        await abort();

        expect(initAbort).toHaveBeenCalled();
        expect(chunkedAbort).toHaveBeenCalled();
    });

    it("should abort and handle no chunked abort", async () => {
        const initAbort = vi.fn();

        const tusState = createTusState({
            items: {},
            options: {}
        });

        createUpload.mockReturnValue({
            abort: initAbort,
            request: Promise.resolve({})
        });

        const { abort } = initTusUpload([item], url, sendOptions, onProgress, tusState, chunkedSender);

        await abort();

        expect(initAbort).toHaveBeenCalled();
    });

    it("should abort and handle no init data", async () => {
        const initAbort = vi.fn();

        const tusState = createTusState({
            items: {},
            options: {}
        });

        createUpload.mockReturnValue({
            abort: initAbort,
            request: Promise.resolve(null)
        });

        const { abort } = initTusUpload([item], url, sendOptions, onProgress, tusState, chunkedSender);

        await abort();

        expect(initAbort).toHaveBeenCalled();
    });
});
