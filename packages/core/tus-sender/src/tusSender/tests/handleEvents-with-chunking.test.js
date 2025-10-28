import { triggerUpdater, utils } from "@rpldy/shared/src/tests/mocks/rpldy-shared.mock";
import { CHUNK_EVENTS } from "@rpldy/chunked-sender";
import { UPLOADER_EVENTS } from "@rpldy/uploader";
import getTusState from "../../tests/tusState.mock";
import { removeResumable } from "../../resumableStore";
import handleEvents from "../handleEvents";
import { TUS_EVENTS } from "../../consts";
import { getHeadersWithoutContentRange } from "../utils";

vi.mock("@rpldy/chunked-sender", async () => {
    const org = await vi.importActual("@rpldy/chunked-sender");

    return {
        ...org,
        CHUNKING_SUPPORT: true,
    };
});

vi.mock("../../resumableStore");
vi.mock("../initTusUpload");
vi.mock("../utils");

describe("handleEvents with chunking support tests", () => {
    const uploader = {
        on: vi.fn(),
    };

    beforeEach(() => {
        clearViMocks(
            uploader,
            utils.isPlainObject,
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

        it("should log debug for CHUNK_FINISH and not update offset if status not in SUCCESS_CODES", () => {
            const tusState = getTusState({
                items: {
                    "i1": { offset: 0 }
                }
            });
            uploader.on.mockImplementationOnce((name, cb) => {
                if (name === CHUNK_EVENTS.CHUNK_FINISH) {
                    cb({
                        chunk: { id: "c1" },
                        item: { id: "i1" },
                        uploadData: {
                            status: 400,
                            response: { headers: { "upload-offset": "123" } }
                        }
                    });
                    expect(tusState.getState().items["i1"].offset).toBe(0);
                }
            });
            handleEvents(uploader, tusState);
        });

        it("should log debug for CHUNK_FINISH and not update offset if response.headers missing", () => {
            const tusState = getTusState({
                items: {
                    "i1": { offset: 0 }
                }
            });
            uploader.on.mockImplementationOnce((name, cb) => {
                if (name === CHUNK_EVENTS.CHUNK_FINISH) {
                    cb({
                        chunk: { id: "c1" },
                        item: { id: "i1" },
                        uploadData: {
                            status: 200,
                            response: {}
                        }
                    });
                    expect(tusState.getState().items["i1"].offset).toBe(0);
                }
            });
            handleEvents(uploader, tusState);
        });

        it("should log debug for CHUNK_FINISH and not update offset if upload-offset is missing", () => {
            const tusState = getTusState({
                items: {
                    "i1": { offset: 0 }
                }
            });

            uploader.on.mockImplementationOnce((name, cb) => {
                if (name === CHUNK_EVENTS.CHUNK_FINISH) {
                    cb({
                        chunk: { id: "c1" },
                        item: { id: "i1" },
                        uploadData: {
                            status: 200,
                            response: { headers: {} }
                        }
                    });
                    expect(tusState.getState().items["i1"].offset).toBe(0);
                }
            });
            handleEvents(uploader, tusState);
        });
    });

    describe("chunkedSender CHUNK_START tests", () => {
        beforeEach(() => {
            //have to resolve the PART_START trigger
            triggerUpdater.mockResolvedValueOnce();
            getHeadersWithoutContentRange.mockImplementationOnce((obj) => obj);
        });

        const triggerChunkStart = (data) => new Promise((resolve) => {
            uploader.on.mockImplementation(async (name, cb) => {
                if (name === CHUNK_EVENTS.CHUNK_START) {
                    const result = await cb(data || {
                        chunk: {
                            start: 1234,
                        },
                        item: { id: "i1" },
                    });

                    resolve(result);
                }
            });
        });

        it("should update send options for chunk using stored offset", async () => {
            const tusState = getTusState({
                items: {
                    "i1": {
                        offset: 123,
                        uploadUrl: "upload.url"
                    }
                }
            });

            const done = triggerChunkStart();

            handleEvents(uploader, tusState);

            const startResponse = await done;

            expect(uploader.on).toHaveBeenCalledWith(CHUNK_EVENTS.CHUNK_START, expect.any(Function));

            expect(startResponse.url).toBe("upload.url");
            expect(startResponse.sendOptions.sendWithFormData).toBe(false);
            expect(startResponse.sendOptions.method).toBe("PATCH");

            expect(startResponse.sendOptions.headers["X-HTTP-Method-Override"]).toBeUndefined();
            expect(startResponse.sendOptions.headers["Content-Range"]).toBeUndefined();
            expect(startResponse.sendOptions.headers["Upload-Length"]).toBeUndefined();
            expect(startResponse.sendOptions.headers["Upload-Concat"]).toBeUndefined();
            expect(startResponse.sendOptions.headers["Upload-Offset"]).toBe(123);
            expect(startResponse.sendOptions.headers["tus-resumable"]).toBe("1");
            expect(startResponse.sendOptions.headers["Content-Type"]).toBe("application/offset+octet-stream");
        });

        it("should update send options for chunk using chunk start", async () => {
            const tusState = getTusState({
                items: {
                    "i1": {
                        offset: 0,
                        uploadUrl: "upload.url"
                    }
                }
            });

            const done = triggerChunkStart();

            handleEvents(uploader, tusState);
            const startResponse = await done;

            expect(uploader.on).toHaveBeenCalledWith(CHUNK_EVENTS.CHUNK_START, expect.any(Function));

            expect(startResponse.url).toBe("upload.url");
            expect(startResponse.sendOptions.sendWithFormData).toBe(false);
            expect(startResponse.sendOptions.method).toBe("PATCH");
            expect(startResponse.sendOptions.headers["Upload-Offset"]).toBe(1234);
        });

        it("should update send options with method override", async () => {
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

            const done = triggerChunkStart();

            handleEvents(uploader, tusState);
            const startResponse = await done;

            expect(uploader.on).toHaveBeenCalledWith(CHUNK_EVENTS.CHUNK_START, expect.any(Function));

            expect(startResponse.url).toBe("upload.url");
            expect(startResponse.sendOptions.sendWithFormData).toBe(false);
            expect(startResponse.sendOptions.method).toBe("POST");
            expect(startResponse.sendOptions.headers["Upload-Offset"]).toBe(1);
            expect(startResponse.sendOptions.headers["X-HTTP-Method-Override"]).toBe("PATCH");
        });

        it("should update send options with length deferred", async () => {
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

            const done = triggerChunkStart({
                chunk: {
                    start: 1234,
                    index: 2
                },
                item: { id: "i1", file: { size: 999 } },
                remainingCount: 0,
            });

            handleEvents(uploader, tusState);
            const startResponse = await done;

            expect(uploader.on).toHaveBeenCalledWith(CHUNK_EVENTS.CHUNK_START, expect.any(Function));

            expect(startResponse.url).toBe("upload.url");
            expect(startResponse.sendOptions.sendWithFormData).toBe(false);
            expect(startResponse.sendOptions.method).toBe("PATCH");
            expect(startResponse.sendOptions.headers["Upload-Length"]).toBe(999);
        });

        it("should not set X-HTTP-Method-Override if overrideMethod is false or undefined", async () => {
            const tusState = getTusState({
                items: {
                    "i1": {
                        offset: 123,
                        uploadUrl: "upload.url"
                    }
                },
                options: { overrideMethod: false }
            });

            const done = triggerChunkStart();

            handleEvents(uploader, tusState);

            const startResponse = await done;

            expect(startResponse.sendOptions.headers["X-HTTP-Method-Override"]).toBeUndefined();
        });

        it("should not set Upload-Length when deferLength is true but remainingCount is not zero", async () => {
            const tusState = getTusState({
                items: {
                    "i1": {
                        offset: 123,
                        uploadUrl: "upload.url"
                    }
                },
                options: { deferLength: true }
            });

            const done = triggerChunkStart({
                chunk: { start: 1234, id: "c1", index: 0 },
                item: { id: "i1", file: { size: 999 } },
                remainingCount: 1, // not zero
            });

            handleEvents(uploader, tusState);
            const startResponse = await done;

            expect(startResponse.sendOptions.headers["Upload-Length"]).toBeUndefined();
        });

        it("should set Upload-Concat header when parallelIdentifier is present", async () => {
            const tusState = getTusState({
                items: {
                    "i1": {
                        offset: 123,
                        uploadUrl: "upload.url",
                        parallelIdentifier: "parallel-123"
                    }
                },
                options: { version: "1" }
            });

            const done = triggerChunkStart({
                chunk: { start: 1234, id: "c1", index: 0 },
                item: { id: "i1" },
            });

            handleEvents(uploader, tusState);
            const startResponse = await done;

            expect(startResponse.sendOptions.headers["Upload-Concat"]).toBe("partial");
        });
    });

    describe("chunkedSender PART_START tests", () => {
        const trigger = vi.fn();
        const uploadUrl = "upload.url";
        const testHeaders = {
            "text-header": "123",
        };

        beforeEach(() => {
            clearViMocks(
                trigger,
            );
        });

        it("should handle PART_START event with non-object response", async () => {
            const tusState = getTusState({
                items: {
                    "i1": {
                        offset: 123,
                        uploadUrl,
                    }
                }
            });

            const eventData= {
                url: "test.url",
                // sendOptions: { headers: { "initial-header": "init" } },
                chunk: {
                    start: 1234,
                },
                item: { id: "i1" },
            };

            triggerUpdater.mockResolvedValueOnce({
                url: "updated.url",
            });

            utils.isPlainObject.mockReturnValueOnce(false);

            getHeadersWithoutContentRange.mockReturnValueOnce(testHeaders);

            const done = new Promise((resolve) => {
                uploader.on.mockImplementation(async (name, cb) => {
                    if (name === CHUNK_EVENTS.CHUNK_START) {
                        const result = await cb(eventData);
                        resolve(result);
                    }
                });
            });

            await handleEvents(uploader, tusState, trigger);
            const partStartRes = await done;

            expect(partStartRes.url).toEqual(uploadUrl);
            expect(partStartRes.sendOptions.headers).toEqual(testHeaders);
        });

        it("should handle PART_START event with empty object response", async () => {
            const tusState = getTusState({
                items: {
                    "i1": {
                        offset: 123,
                        uploadUrl,
                    }
                }
            });

            const eventData= {
                url: "test.url",
                // sendOptions: { headers: { "initial-header": "init" } },
                chunk: {
                    start: 1234,
                },
                item: { id: "i1" },
            };

            triggerUpdater.mockResolvedValueOnce({});

            getHeadersWithoutContentRange.mockReturnValueOnce(testHeaders);

            const done = new Promise((resolve) => {
                uploader.on.mockImplementation(async (name, cb) => {
                    if (name === CHUNK_EVENTS.CHUNK_START) {
                        const result = await cb(eventData);
                        resolve(result);
                    }
                });
            });

            await handleEvents(uploader, tusState, trigger);
            const partStartRes = await done;

            expect(triggerUpdater).toHaveBeenCalledWith(trigger, TUS_EVENTS.PART_START, {
                url: uploadUrl,
                item: eventData.item,
                headers: testHeaders,
                chunk: eventData.chunk,
            });

            expect(partStartRes.url).toEqual(uploadUrl);
            expect(partStartRes.sendOptions.headers).toEqual(testHeaders);
        });

        it("should handle PART_START event - merging response with updated url", async () => {
            const tusState = getTusState({
                items: {
                    "i1": {
                        offset: 123,
                        uploadUrl,
                    }
                }
            });

            const eventData= {
                url: "test.url",
                // sendOptions: { headers: { "initial-header": "init" } },
                chunk: {
                    start: 1234,
                },
                item: { id: "i1" },
            };

            triggerUpdater.mockResolvedValueOnce({
                url: "updated.url",
            });

            utils.isPlainObject.mockReturnValueOnce(true);

            getHeadersWithoutContentRange.mockReturnValueOnce(testHeaders);

            const done = new Promise((resolve) => {
                uploader.on.mockImplementation(async (name, cb) => {
                    if (name === CHUNK_EVENTS.CHUNK_START) {
                        const result = await cb(eventData);
                        resolve(result);
                    }
                });
            });

            await handleEvents(uploader, tusState, trigger);
            const partStartRes = await done;

            expect(partStartRes.url).toEqual("updated.url");
            expect(partStartRes.sendOptions.headers).toEqual(testHeaders);
        });

        it("should handle PART_START event - merging response with headers", async () => {
            const tusState = getTusState({
                items: {
                    "i1": {
                        offset: 123,
                        uploadUrl,
                    }
                }
            });

            const eventData= {
                url: "test.url",
                // sendOptions: { headers: { "initial-header": "init" } },
                chunk: {
                    start: 1234,
                },
                item: { id: "i1" },
            };

            triggerUpdater.mockResolvedValueOnce({
                url: "updated.url",
                headers: {
                    "x-custom-header": "abc",
                }
            });

            utils.isPlainObject.mockReturnValueOnce(true);

            getHeadersWithoutContentRange.mockReturnValueOnce(testHeaders);

            const done = new Promise((resolve) => {
                uploader.on.mockImplementation(async (name, cb) => {
                    if (name === CHUNK_EVENTS.CHUNK_START) {
                        const result = await cb(eventData);
                        resolve(result);
                    }
                });
            });

            await handleEvents(uploader, tusState, trigger);
            const partStartRes = await done;

            expect(partStartRes.url).toEqual("updated.url");
            expect(partStartRes.sendOptions.headers).toEqual({
                ...testHeaders,
                "x-custom-header": "abc",
            });
        });
    });
});
