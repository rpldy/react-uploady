import { request } from "@rpldy/shared/src/tests/mocks/rpldy-shared.mock";
import createMockState from "../../tests/tusState.mock";
import { removeResumable } from "../../resumableStore";
import resumeUpload from "../resumeUpload";

jest.mock("../../resumableStore", () => ({
	removeResumable: jest.fn(),
}));

describe("resumeUpload tests", () => {

	beforeEach(() => {
		clearJestMocks(
			request,
			removeResumable,
		);
	});

	const getMockRequestResponse = (config) => {
		const xhrResponse = {
			status: config.status,
			getResponseHeader: jest.fn(),
		};

		xhrResponse.getResponseHeader
			.mockReturnValueOnce(config.offset)
			.mockReturnValueOnce(config.length);

		const xhr = {
			abort: jest.fn(),
		};

		const p = config.resolveRequest ?
			(config.error ?
				Promise.reject("boom") :
				Promise.resolve(xhrResponse)) :
			new Promise(() => {
			});

		p.xhr = xhr;

		return p;
	};

	const testResume = async (config, parallelIdentifier = null) => {

		config = {
			status: 200,
			length: 200,
			offset: 100,
			deferLength: false,
			lockedStatus: 200,
			resolveRequest: true,
			error: false,
			...config,
		};

		const item = { id: "i1" },
			url = "upload.url";

		const tusState = createMockState({
			items: {
				"i1": {}
			},
			options: {
				deferLength: config.deferLength,
			}
		});

		const pXhr = getMockRequestResponse(config);
		request.mockReturnValueOnce(pXhr);

		if (config.status === 423) {
			request.mockReturnValueOnce(getMockRequestResponse({
				...config,
				status: config.lockedStatus,
			}));
		}

		const resumeResult = resumeUpload(item, url, tusState, parallelIdentifier);

		const response = config.resolveRequest ?
			await resumeResult.request :
			resumeResult.request;

		return {
			url,
			item,
			resumeResult,
			response,
			offset: config.offset,
			tusState,
			request,
			xhr: pXhr.xhr,
		};
	};

	it("should resume upload successfully", async () => {
		const { response, url, offset, tusState, item, request } = await testResume();

		expect(request).toHaveBeenCalledTimes(1);

		expect(response.uploadUrl).toBe(url);
		expect(response.offset).toBe(offset);
		expect(response.isDone).toBe(false);
		expect(response.canResume).toBe(true);

		expect(tusState.getState().items[item.id].uploadUrl).toBe(url);
		expect(tusState.getState().items[item.id].offset).toBe(offset);
	});

	it("should resume upload as done with offset = length", async () => {
		const {
			response, url, offset
		} = await testResume({ offset: 200 });

		expect(response.uploadUrl).toBe(url);
		expect(response.offset).toBe(offset);
		expect(response.isDone).toBe(true);
		expect(response.canResume).toBe(false);
	});

	it("should handle resume success with invalid offset", async () => {
		const {
			response, url, item, tusState
		} = await testResume({ offset: "na" });

		expect(response.uploadUrl).toBe(url);
		expect(response.canResume).toBe(false);
		expect(response.isDone).toBe(false);

		expect(tusState.getState().items[item.id].uploadUrl).toBeUndefined();
		expect(tusState.getState().items[item.id].offset).toBeUndefined();
	});

	it("should handle resume success with invalid length", async () => {
		const {
			response, url, item, tusState
		} = await testResume({ length: "na" });

		expect(response.uploadUrl).toBe(url);
		expect(response.canResume).toBe(false);
		expect(response.isDone).toBe(false);

		expect(tusState.getState().items[item.id].uploadUrl).toBeUndefined();
		expect(tusState.getState().items[item.id].offset).toBeUndefined();
	});

	it("should handle resume success with invalid length & defer length", async () => {
		const {
			response, url, item, tusState, offset,
		} = await testResume({ length: "na", deferLength: true });

		expect(response.uploadUrl).toBe(url);
		expect(response.canResume).toBe(true);
		expect(response.isDone).toBe(false);
		expect(response.offset).toBe(offset);

		expect(tusState.getState().items[item.id].uploadUrl).toBe(url);
		expect(tusState.getState().items[item.id].offset).toBe(offset);
	});

	it("should fail and remove url from storage", async () => {
		const {
			response, item, tusState
		} = await testResume({ status: 403 });

		expect(response.isNew).toBe(false);
		expect(response.canResume).toBe(false);

		expect(removeResumable)
			.toHaveBeenCalledWith(item, tusState.getState().options, null);
	});

	it("should fail and remove url from storage for parallel chunk", async () => {
		const {
			response, item, tusState
		} = await testResume({ status: 403 }, "ci1");

		expect(response.isNew).toBe(false);
		expect(response.canResume).toBe(false);

		expect(removeResumable)
			.toHaveBeenCalledWith(item, tusState.getState().options, "ci1");
	});

	it("should resume upload with locked", async () => {
		const {
			response, item, tusState, url, offset, request
		} = await testResume({ status: 423 });

		expect(request).toHaveBeenCalledTimes(2);

		expect(response.uploadUrl).toBe(url);
		expect(response.offset).toBe(offset);
		expect(response.isDone).toBe(false);
		expect(response.canResume).toBe(true);

		expect(tusState.getState().items[item.id].uploadUrl).toBe(url);
		expect(tusState.getState().items[item.id].offset).toBe(offset);
	});

	it("should fail resume if locked more than once", async () => {
		const {
			response, item, tusState, request
		} = await testResume({ status: 423, lockedStatus: 423 });

		expect(request).toHaveBeenCalledTimes(2);

		expect(response.isNew).toBe(false);
		expect(response.canResume).toBe(false);

		expect(removeResumable)
			.toHaveBeenCalledWith(item, tusState.getState().options, null);
	});

	it("should handle request exception", async () => {
		const {
			response, item, tusState
		} = await testResume({ error: true });

		expect(response.isNew).toBe(false);
		expect(response.canResume).toBe(false);

		expect(removeResumable)
			.toHaveBeenCalledWith(item, tusState.getState().options, null);
	});

	it("should abort resume", async () => {
		const {
			resumeResult, xhr
		} = await testResume({ resolveRequest: false });

		resumeResult.abort();

		expect(xhr.abort).toHaveBeenCalled();
	});

	it("shouldn't abort if resume finished", async () => {
		const {
			response, resumeResult, xhr
		} = await testResume();

		expect(response.canResume).toBe(true);

		resumeResult.abort();

		expect(xhr.abort).not.toHaveBeenCalled();
	});

	it("shouldn't abort if resume failed", async () => {
		const {
			response, resumeResult, xhr
		} = await testResume({ status: 404 });

		expect(response.canResume).toBe(false);

		resumeResult.abort();

		expect(xhr.abort).not.toHaveBeenCalled();
	});

	it("shouldn't abort if resume failed with exception", async () => {
		const {
			response, resumeResult, xhr
		} = await testResume({ error: true });

		expect(response.canResume).toBe(false);

		resumeResult.abort();

		expect(xhr.abort).not.toHaveBeenCalled();
	});
});