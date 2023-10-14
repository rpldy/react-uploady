/*  vitest/no-conditional-expect: 0 */
import { CHUNK_EVENTS } from "@rpldy/chunked-sender";
import { UPLOADER_EVENTS, FILE_STATES } from "@rpldy/uploader";
import getTusState from "../../tests/tusState.mock";
import initTusUpload from "../initTusUpload";
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

    const chunkedSender = {
        on: vi.fn(),
    };

    beforeEach(() => {
        clearViMocks(
            uploader,
            chunkedSender,
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

            handleEvents(uploader, tusState, chunkedSender);
            expect(uploader.on).toHaveBeenCalledWith(UPLOADER_EVENTS.ITEM_FINALIZE, expect.any(Function));
        });

        it("should delete linked parallelChunks from state", () => {
            const tusState = getTusState({
                items: {
                    "i1": {
                        id: "i1",
                        parallelChunks: ["i1-c1", "i1-c2"],
                    },
                    "i1-c1": { id: "i1-c1" },
                    "i1-c2": { id: "i1-c2" },
                    "i2-c1": { id: "i2-c1" },
                }
            });

            uploader.on.mockImplementationOnce((name, cb) => {
                cb({ id: "i1" });
                expect(tusState.getState().items.i1).toBeUndefined();
                expect(tusState.getState().items["i1-c1"]).toBeUndefined();
                expect(tusState.getState().items["i1-c2"]).toBeUndefined();
                expect(tusState.getState().items["i2-c1"]).toBeDefined();
            });

            handleEvents(uploader, tusState, chunkedSender);
            expect(uploader.on).toHaveBeenCalledWith(UPLOADER_EVENTS.ITEM_FINALIZE, expect.any(Function));
        });

        it("should do nothing for ITEM_FINALIZE if item not found", () => {
            const tusState = getTusState({ items: {} });

            uploader.on.mockImplementationOnce((name, cb) => {
                cb({ id: "i1" });
                expect(tusState.updateState).not.toHaveBeenCalled();
            });

            handleEvents(uploader, tusState, chunkedSender);
            expect(uploader.on).toHaveBeenCalled();
        });

        it("should remove storage url for forgetOnSuccess", () => {
            const item = {
                offset: 0,
                parallelChunks: []
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
                }
            });

            handleEvents(uploader, tusState, chunkedSender);
            expect(uploader.on).toHaveBeenCalledWith(UPLOADER_EVENTS.ITEM_FINALIZE, expect.any(Function));
        });
    });

    describe("uploader CHUNK_FINISH tests", () => {
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

            handleEvents(uploader, tusState, chunkedSender);

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

            handleEvents(uploader, tusState, chunkedSender);

            expect(uploader.on).toHaveBeenCalledWith(CHUNK_EVENTS.CHUNK_FINISH, expect.any(Function));
        });

        it("should remove parallel chunk storage url for forgetOnSuccess", () => {
            const tusState = getTusState({
                items: {
                    "i1": {
                        offset: 0,
                        parallelChunks: []
                    }
                },
                options: {
                    chunkSize: 124,
                    parallel: 2,
                    forgetOnSuccess: true,
                }
            });

            uploader.on.mockImplementation((name, cb) => {
                if (name === CHUNK_EVENTS.CHUNK_FINISH) {
                    const data = {
                        chunk: { index: 1 },
                        item: { id: "i1" },
                    };

                    cb(data);

                    expect(removeResumable)
                        .toHaveBeenCalledWith(data.item, tusState.getState().options, `_prlChunk_124_1`);
                }
            });

            handleEvents(uploader, tusState, chunkedSender);

            expect(uploader.on).toHaveBeenCalled();
        });

        it("should do nothing for parallel", () => {
            const tusState = getTusState({
                items: {
                    "i1": {
                        offset: 0,
                        parallelChunks: []
                    }
                },
                options: {
                    chunkSize: 124,
                    parallel: 2,
                }
            });

            uploader.on.mockImplementation((name, cb) => {
                if (name === CHUNK_EVENTS.CHUNK_FINISH) {
                    const data = {
                        chunk: { index: 1 },
                        item: { id: "i1" },
                    };

                    cb(data);
                    expect(tusState.updateState).not.toHaveBeenCalled();
                    expect(removeResumable).not.toHaveBeenCalled();
                }
            });

            handleEvents(uploader, tusState, chunkedSender);

            expect(uploader.on).toHaveBeenCalled();
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

            handleEvents(uploader, tusState, chunkedSender);

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

            handleEvents(uploader, tusState, chunkedSender);

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

            handleEvents(uploader, tusState, chunkedSender);
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

            handleEvents(uploader, tusState, chunkedSender);

            expect(uploader.on).toHaveBeenCalledWith(CHUNK_EVENTS.CHUNK_START, expect.any(Function));
        });

        it("parallel - should update send options for parallelized chunk", () => {
            const tusState = getTusState({
                items: {
                    "i1": {
                        uploadUrl: "upload.url",
                        parallelChunks: []
                    },
                    "ci1": {
                        uploadUrl: "chunk.url",
                    }
                },
                options: {
                    parallel: 2,
                }
            });

            uploader.on.mockImplementation(async (name, cb) => {
                if (name === CHUNK_EVENTS.CHUNK_START) {

                    initTusUpload.mockReturnValueOnce({
                        request: Promise.resolve({
                            state: FILE_STATES.UPLOADING
                        })
                    });

                    const data = {
                        sendOptions: {
                            headers: {
                                "Content-Range": 123,
                            }
                        },
                        chunk: {
                            id: "i1"
                        },
                        chunkItem: {
                            id: "ci1"
                        },
                        item: { id: "i1", file: { size: 999 } },
                    };

                    const result = await cb(data);

                    expect(result.url).toBe("chunk.url");
                    expect(result.sendOptions.sendWithFormData).toBe(false);
                    expect(result.sendOptions.method).toBe("PATCH");
                    expect(result.sendOptions.headers["Upload-Offset"]).toBe(0);
                    expect(result.sendOptions.headers["Upload-Length"]).toBe(undefined);
                    expect(result.sendOptions.headers["Content-Range"]).toBe(undefined);
                    expect(result.sendOptions.headers["Upload-Concat"]).toBe("partial");

                    expect(tusState.getState().items["i1"].parallelChunks[0])
                        .toBe(data.chunkItem.id);
                }
            });

            handleEvents(uploader, tusState, chunkedSender);

            expect(uploader.on).toHaveBeenCalledWith(CHUNK_EVENTS.CHUNK_START, expect.any(Function));
        });

        it("parallel - should return false when chunk already finished", () => {
            const tusState = getTusState({
                items: {
                    "i1": {
                        offset: 0,
                        uploadUrl: "upload.url",
                        parallelChunks: [],
                    }
                },
                options: {
                    parallel: 2,
                }
            });

            uploader.on.mockImplementation(async (name, cb) => {
                if (name === CHUNK_EVENTS.CHUNK_START) {
                    const data = {
                        sendOptions: {},
                        chunk: {
                            start: 1234,
                        },
                        chunkItem: {
                            id: "ci1",
                        },
                        item: { id: "i1" },
                    };

                    initTusUpload.mockReturnValueOnce({
                        request: Promise.resolve({ state: FILE_STATES.FINISHED }),
                    });

                    const result = await cb(data);

                    expect(result).toBe(false);
                    expect(tusState.getState().items["i1"].parallelChunks[0])
                        .toBe(data.chunkItem.id);
                }
            });

            handleEvents(uploader, tusState, chunkedSender);

            expect(uploader.on).toHaveBeenCalledWith(CHUNK_EVENTS.CHUNK_START, expect.any(Function));
        });
    });
});
