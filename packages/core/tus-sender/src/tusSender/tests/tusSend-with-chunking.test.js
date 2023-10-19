import { TUS_SENDER_TYPE } from "../../consts";
import createMockState from "../../tests/tusState.mock";
import doFeatureDetection from "../../featureDetection";
import initTusUpload from "../initTusUpload";
import getTusSend from "../tusSend";

vi.mock("@rpldy/sender");
vi.mock("@rpldy/chunked-sender", async () => {
    const org = await vi.importActual("@rpldy/chunked-sender");
    return {
        ...org,
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

describe("tusSend with chunking tests", () => {
    const chunkedSender = { send: vi.fn() };

    beforeEach(() => {
        clearViMocks(
            initTusUpload,
            doFeatureDetection,
        );
    });

    it("should throw MissingUrlError if no URL", () => {
        const send = getTusSend(chunkedSender, createMockState());
        expect(() => {
            send([1], null);
        }).toThrow(TUS_SENDER_TYPE);
    });

    it("should send with chunkedSender for multiple items", () => {
        const send = getTusSend(chunkedSender, createMockState());

        send([1, 2, 3], "upload.url", "sendOptions", "onProgress");
        expect(chunkedSender.send).toHaveBeenCalledWith([1, 2, 3], "upload.url", "sendOptions", "onProgress");
        expect(doFeatureDetection).not.toHaveBeenCalled();
    });

    it("should send with chunkedSender for url item", () => {
        const send = getTusSend(chunkedSender, createMockState());
        const items = [{ url: "file.com" }];

        send(items, "upload.url", "sendOptions", "onProgress");
        expect(chunkedSender.send).toHaveBeenCalledWith(items, "upload.url", "sendOptions", "onProgress");
    });

    it("should send with tus sender", () => {
        const send = getTusSend(chunkedSender, createMockState());
        const abort = vi.fn(() => true);

        initTusUpload.mockReturnValueOnce({
            request: "request",
            abort,
        });

        const result = send([{ file: {} }], "upload.url", "sendOptions", "onProgress");

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

        const send = getTusSend(chunkedSender, createMockState({
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

        const send = getTusSend(chunkedSender, createMockState({
            options: {
                featureDetection: true
            }
        }));

        const result = send([{ file: {} }], "upload.url", "sendOptions", "onProgress");

        expect(result.abort()).toBe(true);
        expect(abort).toHaveBeenCalled();
    });
});
