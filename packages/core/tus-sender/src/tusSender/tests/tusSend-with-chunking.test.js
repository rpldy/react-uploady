import { createChunkedSender } from "@rpldy/chunked-sender";
import { TUS_SENDER_TYPE } from "../../consts";
import createMockState from "../../tests/tusState.mock";
import doFeatureDetection from "../../featureDetection";
import { initTusUpload, initParallelTusUpload } from "../initTusUpload";
import getTusSend from "../tusSend";
import handleEvents from "../handleEvents";

vi.mock("@rpldy/sender");
vi.mock("@rpldy/chunked-sender", async () => {
    const org = await vi.importActual("@rpldy/chunked-sender");
    return {
        ...org,
        createChunkedSender: vi.fn(),
        CHUNKING_SUPPORT: true,
    };
});

vi.mock("@rpldy/sender", async () => {
    const org = await vi.importActual("@rpldy/sender");
    return {
        ...org,
        MissingUrlError: Error,
    };
});

vi.mock("../../featureDetection");
vi.mock("../initTusUpload");

vi.mock("../handleEvents");

describe("tusSend with chunking tests", () => {
    const uploader = { send: vi.fn() };
    const chunkedSender = { send: vi.fn() };

    beforeEach(() => {
        clearViMocks(
            initTusUpload,
            initParallelTusUpload,
            doFeatureDetection,
            createChunkedSender,
        );
    });

    it("should throw MissingUrlError if no URL", () => {
        const send = getTusSend(uploader, createMockState());
        expect(() => {
            send([1], null);
        }).toThrow(TUS_SENDER_TYPE);
    });

    it("should send with chunkedSender for multiple items", () => {
        const send = getTusSend(uploader, createMockState());

        createChunkedSender.mockReturnValueOnce(chunkedSender);

        send([1, 2, 3], "upload.url", "sendOptions", "onProgress");
        expect(chunkedSender.send).toHaveBeenCalledWith([1, 2, 3], "upload.url", "sendOptions", "onProgress");
        expect(uploader.send).not.toHaveBeenCalled();
        expect(doFeatureDetection).not.toHaveBeenCalled();
    });

    it("should send with chunkedSender for url item", () => {
        const send = getTusSend(chunkedSender, createMockState());
        const items = [{ url: "file.com" }];

        createChunkedSender.mockReturnValueOnce(chunkedSender);

        send(items, "upload.url", "sendOptions", "onProgress");
        expect(chunkedSender.send).toHaveBeenCalledWith(items, "upload.url", "sendOptions", "onProgress");
        expect(uploader.send).not.toHaveBeenCalled();
    });

    it("should send with tus sender", () => {
        const tusState = createMockState();
        const send = getTusSend(uploader, tusState, "trigger");
        const abort = vi.fn(() => true);

        initTusUpload.mockReturnValueOnce({
            request: "request",
            abort,
        });

        const items =[{ file: {} }],
        url = "upload.url";

        createChunkedSender.mockReturnValueOnce(chunkedSender);

        const result = send(items, url, "sendOptions", "onProgress");

        expect(initTusUpload).toHaveBeenCalledWith(
            items, url, "sendOptions", "onProgress", tusState, chunkedSender, "trigger"
        );

        expect(handleEvents).toHaveBeenCalledWith(uploader, tusState, "trigger");
        expect(result.senderType).toBe(TUS_SENDER_TYPE);
        expect(result.request).toBe("request");
        expect(result.abort()).toBe(true);
        expect(abort).toHaveBeenCalled();
    });

    it("should wait for feature detection", async () => {
        const abort = vi.fn(() => true);

        doFeatureDetection.mockReturnValueOnce({
            request: Promise.resolve(),
        });

        initTusUpload.mockReturnValueOnce({
            request: "request",
            abort,
        });

        const send = getTusSend(uploader, createMockState({
            options: {
                featureDetection: true
            }
        }));

        const result = send([{ file: {} }], "upload.url", "sendOptions", "onProgress");

        await result.request;

        expect(result.abort()).toBe(true);
        expect(abort).toHaveBeenCalled();
    });

    it("should be able to abort feature detection", () => {
        const abort = vi.fn(() => true);

        doFeatureDetection.mockReturnValueOnce({
            request: Promise.resolve(),
            abort,
        });

        initTusUpload.mockReturnValueOnce({
            request: "request",
        });

        const send = getTusSend(uploader, createMockState({
            options: {
                featureDetection: true
            }
        }));

        const result = send([{ file: {} }], "upload.url", "sendOptions", "onProgress");

        expect(result.abort()).toBe(true);
        expect(abort).toHaveBeenCalled();
    });

    it("should send with tus sender with parallel", () => {
        const tusState = createMockState({ options: { parallel: 2 } });
        const send = getTusSend(uploader, tusState, "trigger");
        const abort = vi.fn(() => true);

        initParallelTusUpload.mockReturnValueOnce({
            request: "request",
            abort,
        });

        const items =[{ file: {} }],
            url = "upload.url";

        initParallelTusUpload.mockReturnValueOnce({
            request: "request",
            abort,
        });

        const result = send(items, url, "sendOptions", "onProgress");

        expect(initParallelTusUpload).toHaveBeenCalledWith(
            items, url, "sendOptions", "onProgress", tusState, "trigger"
        );

        expect(result.senderType).toBe(TUS_SENDER_TYPE);
        expect(result.request).toBe("request");
        expect(result.abort()).toBe(true);
        expect(abort).toHaveBeenCalled();
    });
});
