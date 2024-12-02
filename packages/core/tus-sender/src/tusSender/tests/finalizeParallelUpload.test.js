import { request, FILE_STATES } from "@rpldy/shared/src/tests/mocks/rpldy-shared.mock";
import { getUploadMetadata, addLocationToResponse } from "../utils";
import createMockState from "../../tests/tusState.mock";
import finalizeParallelUpload from "../finalizeParallelUpload";
import { persistResumable } from "../../resumableStore";

vi.mock("../utils");
vi.mock("../../resumableStore");

describe("finalizeParallelUpload tests", () => {
	beforeEach(() => {
		clearViMocks(
			request,
			getUploadMetadata,
		);

        persistResumable.mockReset();
	});

	it("should do nothing if state != FINISHED", () => {
		finalizeParallelUpload(null, null, null, null, Promise.resolve({
			state: FILE_STATES.ERROR
		}));

		expect(request).not.toHaveBeenCalled();
	});

	it("should do nothing if no item data in state", () => {
		const tusState = createMockState({
			items: {}
		});

		finalizeParallelUpload({ id: "111" }, null, tusState, null, Promise.resolve({
			state: FILE_STATES.FINISHED
		}));

		expect(request).not.toHaveBeenCalled();
	});

	it("should throw if parallel chunks dont match state items", () => {
		const item = { id: "i1" };

		const tusState = createMockState({
            options: { parallel: 2 },
			items: {
				[item.id]: {
                    parallelParts: [
                        { uploadUrl: "ci1.url" },
                        { uploadUrl: "ci2.url" },
                        { uploadUrl: "ci3.url" },
                    ]
				},
				"ci1": { uploadUrl: "ci1.url" }
			}
		});

		expect(finalizeParallelUpload(item, null, tusState, null, Promise.resolve({
			state: FILE_STATES.FINISHED
		}))).rejects.toThrow(`tusSender: something went wrong. found 3 upload urls for 2 parts`);
	});

	it("should finalize successfully and persist part's urls to store", async () => {
		const item = { id: "i1" };

		const tusState = createMockState({
            options: { parallel: 3 },
			items: {
				[item.id]: {
                    parallelParts: [
                        { identifier: "p1", uploadUrl: "ci1.url" },
                        { identifier: "p2", uploadUrl: "ci2.url" },
                        { identifier: "p3", uploadUrl: "ci3.url" },
                    ]
				},
				"ci1": { uploadUrl: "ci1.url" },
				"ci2": { uploadUrl: "ci2.url" }
			}
		});

		const chunkResult = {
			state: FILE_STATES.FINISHED
		};

		addLocationToResponse.mockResolvedValueOnce(chunkResult);

		const url = "upload.url";

		getUploadMetadata.mockReturnValueOnce("metadata");

		const pXhr = Promise.resolve({
			status: 200,
			getResponseHeader: () => "location"
		});

		request.mockReturnValueOnce(pXhr);

		const result = await finalizeParallelUpload(item, url, tusState, null, Promise.resolve(chunkResult));

		expect(request).toHaveBeenCalledWith(url, null, {
			method: "POST",
			headers: {
				"tus-resumable": tusState.getState().options.version,
				"Upload-Concat": `final;ci1.url ci2.url ci3.url`,
				"Upload-Metadata": "metadata",
			}
		});

		expect(result).toEqual(chunkResult);

        expect(persistResumable).toHaveBeenCalledTimes(3);
        expect(persistResumable).toHaveBeenCalledWith(item, "ci1.url", tusState.getState().options, "p1");
        expect(persistResumable).toHaveBeenCalledWith(item, "ci2.url", tusState.getState().options, "p2");
        expect(persistResumable).toHaveBeenCalledWith(item, "ci3.url", tusState.getState().options, "p3");
	});

    it("should finalize successfully and not persist part's urls to store when forget is on", async () => {
        const item = { id: "i1" };

        const tusState = createMockState({
            options: { parallel: 3, forgetOnSuccess: true},
            items: {
                [item.id]: {
                    parallelParts: [
                        { identifier: "p1", uploadUrl: "ci1.url" },
                        { identifier: "p2", uploadUrl: "ci2.url" },
                        { identifier: "p3", uploadUrl: "ci3.url" },
                    ]
                },
                "ci1": { uploadUrl: "ci1.url" },
                "ci2": { uploadUrl: "ci2.url" }
            }
        });

        const chunkResult = {
            state: FILE_STATES.FINISHED
        };

        addLocationToResponse.mockResolvedValueOnce(chunkResult);

        const url = "upload.url";

        getUploadMetadata.mockReturnValueOnce("metadata");

        const pXhr = Promise.resolve({
            status: 200,
            getResponseHeader: () => "location"
        });

        request.mockReturnValueOnce(pXhr);

        const result = await finalizeParallelUpload(item, url, tusState, null, Promise.resolve(chunkResult));

        expect(request).toHaveBeenCalledWith(url, null, {
            method: "POST",
            headers: {
                "tus-resumable": tusState.getState().options.version,
                "Upload-Concat": `final;ci1.url ci2.url ci3.url`,
                "Upload-Metadata": "metadata",
            }
        });

        expect(result).toEqual(chunkResult);

        expect(persistResumable).not.toHaveBeenCalled();
    });

	it("should override item's abort method in state", async () => {
		const item = { id: "i1" };

		const tusState = createMockState({
            options: { parallel: 1 },
			items: {
				[item.id]: {
                    parallelParts: [
                        { uploadUrl: "ci1.url" },
                    ]
				},
				"ci1": { uploadUrl: "ci1.url" },
				"ci2": { uploadUrl: "ci2.url" }
			}
		});

		const chunkResult = {
			state: FILE_STATES.FINISHED
		};

		const url = "upload.url";

		const pXhr = Promise.resolve({
			status: 200,
			getResponseHeader: () => "location"
		});

		pXhr.xhr = {
			abort: vi.fn(),
		};

		request.mockReturnValueOnce(pXhr);

		await finalizeParallelUpload(item, url, tusState, null, Promise.resolve(chunkResult));

		expect(tusState.getState().items[item.id].abort()).toBe(true);

		expect(pXhr.xhr.abort).toHaveBeenCalled();
	});

	it("should fail if no location header", async () => {
		const item = { id: "i1" };

		const tusState = createMockState({
            options: { parallel: 1 },
            items: {
                [item.id]: {
                    parallelParts: [
                        { uploadUrl: "ci1.url" },
                    ]
                },
				"ci1": { uploadUrl: "ci1.url" },
				"ci2": { uploadUrl: "ci2.url" }
			}
		});

		const chunkResult = {
			state: FILE_STATES.FINISHED
		};

		const url = "upload.url";

		getUploadMetadata.mockReturnValueOnce("metadata");

		const pXhr = Promise.resolve({
			status: 200,
			getResponseHeader: () => undefined
		});

		request.mockReturnValueOnce(pXhr);

		const result = await finalizeParallelUpload(item, url, tusState, null, Promise.resolve(chunkResult));

		expect(result).toEqual({
			status: 200,
			state: FILE_STATES.ERROR,
            response: { message: "No valid location header for finalize request" },
		});
	});

	it("should fail if request rejects", async () => {
		const item = { id: "i1" };

		const tusState = createMockState({
            options: { parallel: 1 },
            items: {
                [item.id]: {
                    parallelParts: [
                        { uploadUrl: "ci1.url" },
                    ]
                },
				"ci1": { uploadUrl: "ci1.url" },
				"ci2": { uploadUrl: "ci2.url" }
			}
		});

		const chunkResult = {
			state: FILE_STATES.FINISHED
		};

		const url = "upload.url";

		getUploadMetadata.mockReturnValueOnce("metadata");

        const pXhr = Promise.reject({ status: 500, response: "error!" });

		request.mockReturnValueOnce(pXhr);

		const result = await finalizeParallelUpload(item, url, tusState, null, Promise.resolve(chunkResult));

		expect(result).toEqual({
			status: 500,
			state: FILE_STATES.ERROR,
            response: { message: "error!" },
		});
	});

    it("should fail if no xhr response",  async() => {
        const url = "upload.url";

        const item = { id: "i1" };

        const chunkResult = {
            state: FILE_STATES.FINISHED
        };

        const tusState = createMockState({
            options: { parallel: 1 },
            items: {
                [item.id]: {
                    parallelParts: [
                        { uploadUrl: "ci1.url" },
                    ]
                },
                "ci1": { uploadUrl: "ci1.url" },
                "ci2": { uploadUrl: "ci2.url" }
            }
        });

        const pXhr = Promise.reject(null);
        request.mockReturnValueOnce(pXhr);

        const result = await finalizeParallelUpload(item, url, tusState, null, Promise.resolve(chunkResult));

        expect(result).toEqual({
            status: 0,
            state: FILE_STATES.ERROR,
            response: { message: "" },
        });
    });
});
