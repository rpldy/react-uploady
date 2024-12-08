/*  vitest/no-conditional-expect: 0 */
import { CHUNK_EVENTS } from "@rpldy/chunked-sender";
import { UPLOADER_EVENTS } from "@rpldy/uploader";
import getTusState from "../../tests/tusState.mock";
import { removeResumable } from "../../resumableStore";
import handleEvents from "../handleEvents";

vi.mock("@rpldy/chunked-sender", async () => {
    const org = await vi.importActual("@rpldy/chunked-sender");

    return {
        ...org,
        CHUNKING_SUPPORT: true,
    };
});

vi.mock("../../resumableStore");
vi.mock("../initTusUpload");

describe("handleEvents with chunking support tests", () => {
    const uploader = {
        on: vi.fn(),
    };

    beforeEach(() => {
        clearViMocks(
            uploader,
        );
    });

    beforeEach(() => {
        removeResumable.mockClear();
    });

    describe("uploader ITEM_FINALIZE tests", () => {
        it("should clean up after ITEM_FINALIZE", () => {
            const tusState = getTusState({
                items: {
                    "i1": {
                        offset: 0,
                        parallelChunks: []
                    }
                }
            });

            uploader.on.mockImplementationOnce((name, cb) => {
                cb({ id: "i1" });
                expect(tusState.getState().items.i1).toBeUndefined();
                expect(removeResumable).not.toHaveBeenCalled();
            });

            handleEvents(uploader, tusState);
            expect(uploader.on).toHaveBeenCalledWith(UPLOADER_EVENTS.ITEM_FINALIZE, expect.any(Function));
        });

        it("should delete linked parallelChunks from state", () => {
            const tusState = getTusState({
                items: {
                    "i1": {
                        parallelParts: [
                            { item: { id: "pItem1" } },
                            { item: { id: "pItem2" } },
                        ]
                    },
                    "pItem1": { uploadUrl: "ci1.url" },
                    "pItem2": { uploadUrl: "ci2.url" },
                    "pItem3": { uploadUrl: "ci3.url" },
                }
            });

            uploader.on.mockImplementationOnce((name, cb) => {
                cb({ id: "i1" });
                expect(tusState.getState().items.i1).toBeUndefined();
                expect(tusState.getState().items["pItem1"]).toBeUndefined();
                expect(tusState.getState().items["pItem2"]).toBeUndefined();
                expect(tusState.getState().items["pItem3"]).toBeDefined();
            });

            handleEvents(uploader, tusState);
            expect(uploader.on).toHaveBeenCalledWith(UPLOADER_EVENTS.ITEM_FINALIZE, expect.any(Function));
        });

        it("should do nothing for ITEM_FINALIZE if item not found", () => {
            const tusState = getTusState({ items: {} });

            uploader.on.mockImplementationOnce((name, cb) => {
                cb({ id: "i1" });
                expect(tusState.updateState).not.toHaveBeenCalled();
            });

            handleEvents(uploader, tusState);
            expect(uploader.on).toHaveBeenCalled();
        });

        it("should remove storage url for forgetOnSuccess", () => {
            const parts = [
                { item: { id: "pItem1", identifier: "i1" } },
                { item: { id: "pItem2", identifier: "i2" } },
            ];

            const item = {
                offset: 0,
                parallelParts: parts,
            };

            const tusState = getTusState({
                items: {
                    "i1": item,
                },
                options: {
                    forgetOnSuccess: true
                }
            });

            uploader.on.mockImplementationOnce((name, cb) => {
                if (name === UPLOADER_EVENTS.ITEM_FINALIZE) {
                    cb({ id: "i1" });
                    expect(tusState.getState().items.i1).toBeUndefined();
                    expect(removeResumable).toHaveBeenCalledWith({ id: "i1" }, tusState.getState().options);
                    expect(removeResumable).toHaveBeenCalledWith(parts[0].item, tusState.getState().options, parts[0].identifier);
                    expect(removeResumable).toHaveBeenCalledWith(parts[1].item, tusState.getState().options, parts[1].identifier);
                }
            });

            handleEvents(uploader, tusState);
            expect(uploader.on).toHaveBeenCalledWith(UPLOADER_EVENTS.ITEM_FINALIZE, expect.any(Function));
        });
    });

    describe("chunkedSender CHUNK_FINISH tests", () => {
        it.each([
            false,
            true
        ])("should handle CHUNK_FINISH event for success = %s chunk upload", (success) => {
            const tusState = getTusState({
                items: {
                    "i1": {
                        offset: 0,
                        test: 111
                    }
                }
            });

            uploader.on.mockImplementation((name, cb) => {
                if (name === CHUNK_EVENTS.CHUNK_FINISH) {
                    cb({
                        chunk: {},
                        item: { id: "i1" },
                        uploadData: {
                            status: success ? 200 : 400,
                            response: {
                                headers: {
                                    "upload-offset": 123
                                }
                            }
                        }
                    });

                    expect(tusState.getState().items["i1"].offset).toBe((success ? 123 : 0));
                }
            });

            handleEvents(uploader, tusState);

            expect(uploader.on).toHaveBeenCalledWith(CHUNK_EVENTS.CHUNK_FINISH, expect.any(Function));
        });

        it("should handle CHUNK_FINISH and do nothing if item not found", () => {
            const tusState = getTusState({ items: {} });

            uploader.on.mockImplementation((name, cb) => {
                if (name === CHUNK_EVENTS.CHUNK_FINISH) {
                    cb({
                        chunk: {},
                        item: { id: "i1" },
                        uploadData: {}
                    });

                    expect(tusState.updateState).not.toHaveBeenCalled();
                }
            });

            handleEvents(uploader, tusState);

            expect(uploader.on).toHaveBeenCalledWith(CHUNK_EVENTS.CHUNK_FINISH, expect.any(Function));
        });
    });

    describe("chunkedSender CHUNK_START tests", () => {
        it("should update send options for chunk using stored offset", () => {
            const tusState = getTusState({
                items: {
                    "i1": {
                        offset: 123,
                        uploadUrl: "upload.url"
                    }
                }
            });

            uploader.on.mockImplementation(async (name, cb) => {
                if (name === CHUNK_EVENTS.CHUNK_START) {
                    const result = await cb({
                        chunk: {
                            start: 1234,
                        },
                        item: { id: "i1" },
                    });

                    expect(result.url).toBe("upload.url");
                    expect(result.sendOptions.sendWithFormData).toBe(false);
                    expect(result.sendOptions.method).toBe("PATCH");

                    expect(result.sendOptions.headers["X-HTTP-Method-Override"]).toBeUndefined();
                    expect(result.sendOptions.headers["Content-Range"]).toBeUndefined();
                    expect(result.sendOptions.headers["Upload-Length"]).toBeUndefined();
                    expect(result.sendOptions.headers["Upload-Offset"]).toBe(123);
                    expect(result.sendOptions.headers["tus-resumable"]).toBe("1");
                    expect(result.sendOptions.headers["Content-Type"]).toBe("application/offset+octet-stream");
                }
            });

            handleEvents(uploader, tusState);

            expect(uploader.on).toHaveBeenCalledWith(CHUNK_EVENTS.CHUNK_START, expect.any(Function));
        });

        it("should update send options for chunk using chunk start", () => {
            const tusState = getTusState({
                items: {
                    "i1": {
                        offset: 0,
                        uploadUrl: "upload.url"
                    }
                }
            });

            uploader.on.mockImplementation(async (name, cb) => {
                if (name === CHUNK_EVENTS.CHUNK_START) {
                    const result = await cb({
                        chunk: {
                            start: 1234,
                        },
                        item: { id: "i1" },
                    });

                    expect(result.url).toBe("upload.url");
                    expect(result.sendOptions.sendWithFormData).toBe(false);
                    expect(result.sendOptions.method).toBe("PATCH");
                    expect(result.sendOptions.headers["Upload-Offset"]).toBe(1234);
                }
            });

            handleEvents(uploader, tusState);

            expect(uploader.on).toHaveBeenCalledWith(CHUNK_EVENTS.CHUNK_START, expect.any(Function));
        });

        it("should update send options with method override", () => {
            const tusState = getTusState({
                options: {
                    overrideMethod: true,
                },
                items: {
                    "i1": {
                        offset: 1,
                        uploadUrl: "upload.url"
                    }
                }
            });

            uploader.on.mockImplementation(async (name, cb) => {
                if (name === CHUNK_EVENTS.CHUNK_START) {
                    const result = await cb({
                        chunk: {
                            start: 1234,
                        },
                        item: { id: "i1" },
                    });

                    expect(result.url).toBe("upload.url");
                    expect(result.sendOptions.sendWithFormData).toBe(false);
                    expect(result.sendOptions.method).toBe("POST");
                    expect(result.sendOptions.headers["Upload-Offset"]).toBe(1);
                }
            });

            handleEvents(uploader, tusState);
            expect(uploader.on).toHaveBeenCalledWith(CHUNK_EVENTS.CHUNK_START, expect.any(Function));
        });

        it("should update send options with length deferred", () => {
            const tusState = getTusState({
                items: {
                    "i1": {
                        offset: 123,
                        uploadUrl: "upload.url"
                    }
                },
                options: {
                    deferLength: true,
                }
            });

            uploader.on.mockImplementation(async (name, cb) => {
                if (name === CHUNK_EVENTS.CHUNK_START) {
                    const result = await cb({
                        chunk: {
                            start: 1234,
                            index: 2
                        },
                        item: { id: "i1", file: { size: 999 } },
                        remainingCount: 0,
                    });

                    expect(result.url).toBe("upload.url");
                    expect(result.sendOptions.sendWithFormData).toBe(false);
                    expect(result.sendOptions.method).toBe("PATCH");
                    expect(result.sendOptions.headers["Upload-Length"]).toBe(999);
                }
            });

            handleEvents(uploader, tusState);

            expect(uploader.on).toHaveBeenCalledWith(CHUNK_EVENTS.CHUNK_START, expect.any(Function));
        });
    });
});
