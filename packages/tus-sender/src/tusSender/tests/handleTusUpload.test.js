import { FILE_STATES } from "@rpldy/shared";
import createUpload from "../initTusUpload/createUpload";
import { persistResumable } from "../resumableStore";
import finalizeParallelUpload from "../finalizeParallelUpload";
import createMockState from "../tests/tusState.mock";
import handleTusUpload from "../handleTusUpload";

jest.mock("../initTusUpload/createUpload", () => jest.fn());
jest.mock("../finalizeParallelUpload", () => jest.fn());

jest.mock("../resumableStore", () => ({
	persistResumable: jest.fn(),
}));

describe("handleTusUpload tests", () => {

	const chunkedSender = {
		send: jest.fn(),
	};

	beforeEach(() => {
		clearJestMocks(
			chunkedSender.send,
			createUpload,
			persistResumable,
			finalizeParallelUpload,
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
				isDone: true,
			}),
		);

		expect(result).toEqual({
			status: 200,
			state: FILE_STATES.FINISHED,
			response: "TUS server has file",
		});
	});

	describe("parallel tests", () => {
		it("should handle parallel upload", async () => {
			const tusState = createMockState({
				options: { parallel: 2 },
			});

			const item = { id: "i1" };

			const result = await handleTusUpload(
				[item],
				null,
				null,
				null,
				tusState,
				chunkedSender,
				Promise.resolve({
					isNew: true,
					uploadUrl: "upload.url"
				}),
				false,
				"ci1"
			);

			expect(result).toEqual({
				status: 200,
				state: FILE_STATES.UPLOADING,
				response: "TUS server created upload for parallelized part",
			});

			expect(persistResumable).toHaveBeenCalledWith(item, "upload.url", tusState.getState().options, "ci1");
		});

		it("should handle parallel upload without upload url", async () => {
			const tusState = createMockState({
				options: { parallel: 2 },
			});

			const item = { id: "i1" };

			const result = await handleTusUpload(
				[item],
				null,
				null,
				null,
				tusState,
				chunkedSender,
				Promise.resolve({
					isNew: true,
				}),
				false,
				"ci1"
			);

			expect(result).toEqual({
				status: 200,
				state: FILE_STATES.UPLOADING,
				response: "TUS server created upload for parallelized part",
			});

			expect(persistResumable).not.toHaveBeenCalled();
		});
	});

	describe("chunked upload tests", () => {
		it("should do chunked for new upload", async () => {
			const item = { id: "i1" };

			const tusState = createMockState({
				items: {
					[item.id]: {}
				},
				options: {},
			});

			chunkedSender.send.mockReturnValueOnce({
				abort: "abort",
				request: "chunked-request"
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
				null,
			);

			expect(chunkedSender.send).toHaveBeenCalledWith([item], "server.com", {}, "onProgress");
			expect(persistResumable).toHaveBeenCalledWith(item, "upload.url", tusState.getState().options);
			expect(result).toBe("chunked-request");
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
				abort: "abort",
				request: "chunked-request"
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
			expect(result).toBe("chunked-request");
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
				abort: "abort",
				request: "chunked-request"
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
			expect(result).toBe("chunked-request");
		});

		it("should do finalize call for parallel", async () => {
			const item = { id: "i1" };

			const tusState = createMockState({
				items: {
					[item.id]: {}
				},
				options: { parallel: 2 },
			});

			chunkedSender.send.mockReturnValueOnce({
				abort: "abort",
				request: "chunked-request"
			});

			finalizeParallelUpload.mockResolvedValueOnce("parallel-finalized");

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
				null,
			);

			expect(chunkedSender.send).toHaveBeenCalledWith([item], "server.com", {}, "onProgress");
			expect(persistResumable).toHaveBeenCalledWith(item, "upload.url", tusState.getState().options);
			expect(result).toBe("parallel-finalized");
			expect(tusState.getState().items[item.id].abort).toBe("abort");
		});
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
				request: "chunked-request"
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
			expect(persistResumable).toHaveBeenCalledWith(item, "upload.url", tusState.getState().options);
			expect(persistResumable).toHaveBeenCalledTimes(1);
			expect(result).toBe("chunked-request");
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
				request: "chunked-request"
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
			expect(persistResumable).toHaveBeenCalledWith(item, "upload.url", tusState.getState().options);
			expect(persistResumable).toHaveBeenCalledTimes(1);
			expect(result).toBe("chunked-request");
			expect(tusState.getState().items[item.id].abort).toBe("abort");
		});
	});
});
