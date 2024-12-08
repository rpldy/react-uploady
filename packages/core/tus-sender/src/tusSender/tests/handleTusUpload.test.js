import { FILE_STATES } from "@rpldy/shared";
import createUpload from "../initTusUpload/createUpload";
import { persistResumable } from "../../resumableStore";
import createMockState from "../../tests/tusState.mock";
import handleTusUpload from "../handleTusUpload";

vi.mock("../initTusUpload/createUpload", () => ({ default: vi.fn() }));

vi.mock("../../resumableStore", () => ({
    persistResumable: vi.fn(),
}));

describe("handleTusUpload tests", () => {
    const chunkedSender = {
        send: vi.fn(),
    };

    beforeEach(() => {
        clearViMocks(
            chunkedSender.send,
            createUpload,
            persistResumable,
        );
    });

    it("should return failed if no initData", async () => {
        const result = await handleTusUpload(
            null,
            null,
            null,
            null,
            null,
            chunkedSender,
            Promise.resolve(null),
        );

        expect(chunkedSender.send).not.toHaveBeenCalled();
        expect(result).toEqual({
            status: 0,
            state: FILE_STATES.ERROR,
            response: "TUS initialize failed",
        });
    });

    it("should return finished for init done", async () => {
        const result = await handleTusUpload(
            [{ id: "i1" }],
            null,
            null,
            null,
            null,
            chunkedSender,
            Promise.resolve({
                uploadUrl: "tus-file-loc",
                isDone: true,
            }),
        );

        expect(result).toEqual({
            status: 200,
            state: FILE_STATES.FINISHED,
            response: { message: "TUS server has file", location: "tus-file-loc" },
        });
    });

    describe("chunked upload tests", () => {
        it("should do chunked for new upload", async () => {
            const item = { id: "i1" };

            const tusState = createMockState({
                items: {
                    [item.id]: { parallelIdentifier: "p1" },
                },
                options: {},
            });

            chunkedSender.send.mockReturnValueOnce({
                abort: "abort",
                request: Promise.resolve({
                    state: FILE_STATES.ABORTED
                })
            });

            const result = await handleTusUpload(
                [item],
                "server.com",
                {},
                "onProgress",
                tusState,
                chunkedSender,
                Promise.resolve({
                    isNew: true,
                    uploadUrl: "upload.url"
                }),
                false,
                null
            );

            expect(chunkedSender.send).toHaveBeenCalledWith([item], "server.com", {}, "onProgress");
            expect(persistResumable).toHaveBeenCalledWith(item, "upload.url", tusState.getState().options, "p1");
            expect(result).toEqual({ state: FILE_STATES.ABORTED });
            expect(tusState.getState().items[item.id].abort).toBe("abort");
        });

        it("should set startByte for sendDataOnCreate", async () => {
            const item = { id: "i1" };

            const tusState = createMockState({
                items: {
                    [item.id]: {}
                },
                options: {
                    sendDataOnCreate: true,
                },
            });

            chunkedSender.send.mockReturnValueOnce({
                request: Promise.resolve({
                    state: FILE_STATES.ABORTED
                })
            });

            const result = await handleTusUpload(
                [item],
                "server.com",
                {},
                "onProgress",
                tusState,
                chunkedSender,
                Promise.resolve({
                    isNew: true,
                    uploadUrl: "upload.url",
                    offset: 123
                }),
                false,
                null,
            );

            expect(chunkedSender.send).toHaveBeenCalledWith([item], "server.com", { startByte: 123 }, "onProgress");
            expect(result).toEqual({ state: FILE_STATES.ABORTED });
        });

        it("should do chunked for resume", async () => {
            const item = { id: "i1" };

            const tusState = createMockState({
                items: {
                    [item.id]: {}
                },
                options: {},
            });

            chunkedSender.send.mockReturnValueOnce({
                request: Promise.resolve({
                    state: FILE_STATES.ABORTED
                })
            });

            const result = await handleTusUpload(
                [item],
                "server.com",
                {},
                "onProgress",
                tusState,
                chunkedSender,
                Promise.resolve({
                    canResume: true,
                    uploadUrl: "upload.url",
                    offset: 123
                }),
                false,
                null,
            );

            expect(chunkedSender.send).toHaveBeenCalledWith([item], "server.com", { startByte: 123 }, "onProgress");
            expect(result).toEqual({
                state: FILE_STATES.ABORTED
            });
        });

        // it("should do finalize call for parallel", async () => {
        // 	const item = { id: "i1" };
        //
        // 	const tusState = createMockState({
        // 		items: {
        // 			[item.id]: {}
        // 		},
        // 		options: { parallel: 2 },
        // 	});
        //
        //     chunkedSender.send.mockReturnValueOnce({
        //         abort: "abort",
        //         request: Promise.resolve({
        //             state: FILE_STATES.ABORTED
        //         })
        //     });
        //
        // 	finalizeParallelUpload.mockResolvedValueOnce("parallel-finalized");
        //
        // 	const result = await handleTusUpload(
        // 		[item],
        // 		"server.com",
        // 		{},
        // 		"onProgress",
        // 		tusState,
        // 		chunkedSender,
        // 		Promise.resolve({
        // 			isNew: true,
        // 			uploadUrl: "upload.url"
        // 		}),
        // 		false,
        // 		null,
        // 	);
        //
        // 	expect(chunkedSender.send).toHaveBeenCalledWith([item], "server.com", {}, "onProgress");
        // 	expect(persistResumable).toHaveBeenCalledWith(item, "upload.url", tusState.getState().options);
        // 	expect(result).toBe("parallel-finalized");
        // 	expect(tusState.getState().items[item.id].abort).toBe("abort");
        // });
    });

    describe("resume failed tests", () => {
        it("should create if isResume and no initData", async () => {
            const item = { id: "i1" };

            const tusState = createMockState({
                items: {
                    [item.id]: {}
                },
                options: {},
            });

            chunkedSender.send.mockReturnValueOnce({
                abort: "abort",
                request: Promise.resolve({
                    state: FILE_STATES.ABORTED
                })
            });

            createUpload.mockReturnValueOnce({
                request: Promise.resolve({
                    isNew: true,
                    uploadUrl: "upload.url"
                })
            });

            const result = await handleTusUpload(
                [item],
                "server.com",
                {},
                "onProgress",
                tusState,
                chunkedSender,
                Promise.resolve(null),
                true,
                null,
            );

            expect(chunkedSender.send).toHaveBeenCalledWith([item], "server.com", {}, "onProgress");
            expect(chunkedSender.send).toHaveBeenCalledTimes(1);
            expect(persistResumable).toHaveBeenCalledWith(item, "upload.url", tusState.getState().options, undefined);
            expect(persistResumable).toHaveBeenCalledTimes(1);
            expect(result).toEqual({
                state: FILE_STATES.ABORTED
            });
            expect(tusState.getState().items[item.id].abort).toBe("abort");
        });

        it("should create if resume failed", async () => {
            const item = { id: "i1" };

            const tusState = createMockState({
                items: {
                    [item.id]: {}
                },
                options: {},
            });

            chunkedSender.send.mockReturnValueOnce({
                abort: "abort",
                request: Promise.resolve({
                    state: FILE_STATES.ABORTED
                })
            });

            createUpload.mockReturnValueOnce({
                request: Promise.resolve({
                    isNew: true,
                    uploadUrl: "upload.url"
                })
            });

            const result = await handleTusUpload(
                [item],
                "server.com",
                {},
                "onProgress",
                tusState,
                chunkedSender,
                Promise.resolve({
                    isNew: false,
                    canResume: false,
                }),
                true,
                null,
            );

            expect(chunkedSender.send).toHaveBeenCalledWith([item], "server.com", {}, "onProgress");
            expect(chunkedSender.send).toHaveBeenCalledTimes(1);
            expect(persistResumable).toHaveBeenCalledWith(item, "upload.url", tusState.getState().options, undefined);
            expect(persistResumable).toHaveBeenCalledTimes(1);
            expect(result).toEqual({
                state: FILE_STATES.ABORTED
            });
            expect(tusState.getState().items[item.id].abort).toBe("abort");
        });

        it("should pass parallel id to create", async () => {
            const item = { id: "i1" };
            const uploadUrl = "uploadUrl";

            const tusState = createMockState({
                items: {
                    [item.id]: {}
                },
                options: {},
            });

            createUpload.mockReturnValueOnce({
                request: Promise.resolve({
                    isDone: true,
                    uploadUrl,
                })
            });

            const result = await handleTusUpload(
                [item],
                "server.com",
                {},
                "onProgress",
                tusState,
                chunkedSender,
                Promise.resolve({
                    isDone: false,
                    isNew: false,
                    canResume: false,
                }),
                true,
                "p1",
            );

            expect(createUpload).toHaveBeenCalledWith(item, "server.com", tusState, {}, "p1");

            expect(result).toEqual({
                response: { location: uploadUrl, message: "TUS server has file" },
                status: 200,
                state: FILE_STATES.FINISHED,
            });
        });
    });
});
