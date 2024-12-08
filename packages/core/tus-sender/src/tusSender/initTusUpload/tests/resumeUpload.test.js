import { request, triggerUpdater } from "@rpldy/shared/src/tests/mocks/rpldy-shared.mock";
import createMockState from "../../../tests/tusState.mock";
import { removeResumable } from "../../../resumableStore";
import resumeUpload from "../resumeUpload";

vi.mock("../../../resumableStore", () => ({
	removeResumable: vi.fn(),
}));
vi.mock("@rpldy/simple-state");

describe("resumeUpload tests", () => {
	beforeEach(() => {
		clearViMocks(
			request,
			removeResumable,
            triggerUpdater,
		);
	});

	const getMockRequestResponse = (config) => {
		const xhrResponse = {
			status: config.status,
			getResponseHeader: vi.fn(),
		};

		xhrResponse.getResponseHeader
			.mockReturnValueOnce(config.offset)
			.mockReturnValueOnce(config.length);

		const xhr = {
			abort: vi.fn(),
		};

		const p = config.resolveRequest ?
			(config.error ?
				Promise.reject("boom") :
				Promise.resolve(xhrResponse)) :
			new Promise((resolve) => {
                xhr.resolveMockRequest = resolve;
			});

		p.xhr = xhr;
		return p;
	};

	const testResume = async (config, parallelIdentifier = null, startResponse = {}) => {
		config = {
			status: 200,
			length: 200,
			offset: 100,
			deferLength: false,
			lockedStatus: 200,
			resolveRequest: true,
			error: false,
            version: "1",
			...config,
		};

		const item = { id: "i1" },
			url = "upload.url";

        triggerUpdater.mockResolvedValueOnce(startResponse);

		const tusState = createMockState({
			items: {
				"i1": {}
			},
			options: {
				deferLength: config.deferLength,
                version: config.version,
                resumeHeaders: {
                    "x-test": "123",
                }
			}
		});

		const pXhr = getMockRequestResponse(config);

        if (startResponse !== false ) {
            request.mockReturnValueOnce(pXhr);

            if (config.status === 423) {
                request.mockReturnValueOnce(getMockRequestResponse({
                    ...config,
                    status: config.lockedStatus,
                }));
            }
        }

		const resumeResult = resumeUpload(item, url, tusState, "trigger", parallelIdentifier);

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

        expect(request).toHaveBeenCalledWith(url, null ,{
            method: "HEAD",
            headers: {
                "tus-resumable": "1",
                "x-test": "123",
            }
        });

		expect(response.uploadUrl).toBe(url);
		expect(response.offset).toBe(offset);
		expect(response.isDone).toBe(false);
		expect(response.canResume).toBe(true);

		expect(tusState.getState().items[item.id].uploadUrl).toBe(url);
		expect(tusState.getState().items[item.id].offset).toBe(offset);

        expect(request.mock.calls[0][2].headers["x-test"]).toBe("123");
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

    describe("RESUME_START event handler tests", () => {
        const overrideUrl = "override.com";

        it("should overwrite url and merge resume headers", async () => {
            const { request } = await testResume({}, null, {
                url: overrideUrl,
                resumeHeaders: {
                    "x-test": "456",
                    "x-foo": "bar",
                }
            });

            expect(request).toHaveBeenCalledWith(overrideUrl, null ,{
                method: "HEAD",
                headers: {
                    "tus-resumable": "1",
                    "x-test": "456",
                    "x-foo": "bar",
                }
            });
        });

        it("should resume when handler response is boolean true", async () => {
            const { request } = await testResume({}, null, true);

            expect(request).toHaveBeenCalledWith("upload.url", null ,{
                method: "HEAD",
                headers: {
                    "tus-resumable": "1",
                    "x-test": "123",
                }
            });
        });

        it("should cancel resume from start event handler", async () => {
            const { request, response } = await testResume({}, null, false);

            expect(response).toStrictEqual({ isNew: false, canResume: false, uploadUrl: "" });
            expect(request).toHaveBeenCalledTimes(0);
        });

        it("should handle abort while waiting resume request response", async () => {
            const { resumeResult, xhr } = await testResume({ resolveRequest: false });

            await triggerUpdater.mock.results[0].value;
            resumeResult.abort();
            xhr.resolveMockRequest();

            const result = await resumeResult.request;

            expect(result).toStrictEqual({ isNew: false, canResume: false, uploadUrl: "" });
        });
    });

    describe("resume locked tests", () => {
       const setTriggerUpdater = () => {
           triggerUpdater.mockReset();
           triggerUpdater
               .mockResolvedValueOnce(undefined)
               .mockResolvedValueOnce({ });
       };

        it("should resume upload with locked", async () => {
            setTriggerUpdater();

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
            setTriggerUpdater();

            const {
                response, item, tusState, request
            } = await testResume({ status: 423, lockedStatus: 423 });

            expect(request).toHaveBeenCalledTimes(2);

            expect(response.isNew).toBe(false);
            expect(response.canResume).toBe(false);

            expect(removeResumable)
                .toHaveBeenCalledWith(item, tusState.getState().options, null);
        });
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

        await resumeResult.abort();

        await new Promise((resolve) =>
            setTimeout(() => {
                expect(xhr.abort).toHaveBeenCalled();
                resolve();
            }, 100));
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
