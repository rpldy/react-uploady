import createTusState from "../../../tests/tusState.mock";
import { retrieveResumable } from "../../../resumableStore";
import handleTusUpload from "../../handleTusUpload";
import createUpload from "../createUpload";
import resumeUpload from "../resumeUpload";
import initTusUpload from "../initTusUpload";

jest.mock("../../../resumableStore", () => ({
	retrieveResumable: jest.fn(),
}));

jest.mock("../../handleTusUpload", () => jest.fn());
jest.mock("../createUpload", () => jest.fn());
jest.mock("../resumeUpload", () => jest.fn());

describe("initTusUpload tests", () => {

	beforeEach(() => {
		clearJestMocks(
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

		initTusUpload([item], url, sendOptions, onProgress, tusState, chunkedSender);

		expect(tusState.getState().items[item.id].id).toBe(item.id);
		expect(tusState.getState().items[item.id].size).toBe(item.file.size);

		expect(resumeUpload).toHaveBeenCalledWith(item, "stored.url", tusState, null);

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

	it("should init parallel upload", async () => {
		const tusState = createTusState({
			items: {},
			options: { parallel: 2 }
		});

		const { abort } = initTusUpload([item], url, sendOptions, onProgress, tusState, chunkedSender);

		expect(abort()).toBe(true);

		expect(tusState.getState().items[item.id].id).toBe(item.id);
		expect(tusState.getState().items[item.id].size).toBe(item.file.size);

		expect(resumeUpload).not.toHaveBeenCalled();
		expect(createUpload).not.toHaveBeenCalled();
		expect(retrieveResumable).not.toHaveBeenCalled();

		expect(handleTusUpload).toHaveBeenCalledWith(
			[item],
			url,
			sendOptions,
			onProgress,
			tusState,
			chunkedSender,
			expect.any(Promise),
			false,
			null
		);

		const initRes = await handleTusUpload.mock.calls[0][6];
		expect(initRes.isNew).toBe(true);
	});

	it("should abort init call and chunked call", async() => {
		const initAbort = jest.fn(),
			chunkedAbort = jest.fn();

		const tusState = createTusState({
			items: {},
			options: {}
		});

		createUpload.mockReturnValue({
			abort: initAbort,
			request: Promise.resolve({})
		});

		const { abort } = initTusUpload([item], url, sendOptions, onProgress, tusState, chunkedSender);

		tusState.updateState((state) =>{
			state.items[item.id] = {
				abort: chunkedAbort
			};
		});

		await abort();

		expect(initAbort).toHaveBeenCalled();
		expect(chunkedAbort).toHaveBeenCalled();
	});

	it("should abort and handle no chunked abort", async() => {
		const initAbort = jest.fn();

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

	it("should abort and handle no init data", async() => {
		const initAbort = jest.fn();

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
