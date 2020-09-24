import { request, FILE_STATES } from "@rpldy/shared/src/tests/mocks/rpldy-shared.mock";
import { getUploadMetadata } from "../utils";
import createMockState from "../../tests/tusState.mock";
import finalizeParallelUpload from "../finalizeParallelUpload";

jest.mock("../utils", () => ({
	getUploadMetadata: jest.fn(),
}));

describe("finalizeParallelUpload tests", () => {

	beforeEach(() => {
		clearJestMocks(
			request,
			getUploadMetadata,
		);
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
			items: {
				[item.id]: {
					parallelChunks: ["ci1", "ci2"],
				},
				"ci1": { uploadUrl: "ci1.url" }
			}
		});

		expect(finalizeParallelUpload(item, null, tusState, null, Promise.resolve({
			state: FILE_STATES.FINISHED
		}))).rejects.toThrow(`tusSender: something went wrong. found 1 upload urls for 2 chunks`);
	});

	it("should finalize successfully", async () => {
		const item = { id: "i1" };

		const tusState = createMockState({
			items: {
				[item.id]: {
					parallelChunks: ["ci1", "ci2"],
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
			getResponseHeader: () => "location"
		});

		request.mockReturnValueOnce(pXhr);

		const result = await finalizeParallelUpload(item, url, tusState, null, Promise.resolve(chunkResult));

		expect(request).toHaveBeenCalledWith(url, null, {
			method: "POST",
			headers: {
				"tus-resumable": tusState.getState().options.version,
				"Upload-Concat": `final;ci1.url ci2.url`,
				"Upload-Metadata": "metadata",
			}
		});

		expect(result).toEqual(chunkResult);
	});

	it("should override item's abort method in state", async () => {
		const item = { id: "i1" };

		const tusState = createMockState({
			items: {
				[item.id]: {
					parallelChunks: ["ci1", "ci2"],
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
			abort: jest.fn(),
		};

		request.mockReturnValueOnce(pXhr);

		await finalizeParallelUpload(item, url, tusState, null, Promise.resolve(chunkResult));

		expect(tusState.getState().items[item.id].abort()).toBe(true);

		expect(pXhr.xhr.abort).toHaveBeenCalled();
	});

	it("should fail if no location header", async () => {
		const item = { id: "i1" };

		const tusState = createMockState({
			items: {
				[item.id]: {
					parallelChunks: ["ci1", "ci2"],
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
			response: "No valid location header for finalize request",
		});
	});

	it("should fail if request rejects", async () => {

		const item = { id: "i1" };

		const tusState = createMockState({
			items: {
				[item.id]: {
					parallelChunks: ["ci1", "ci2"],
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
			response: "error!",
		});
	});

    it("should fail if no xhr response",  async() => {
        const url = "upload.url";

        const item = { id: "i1" };

        const chunkResult = {
            state: FILE_STATES.FINISHED
        };

        const tusState = createMockState({
            items: {
                [item.id]: {
                    parallelChunks: ["ci1", "ci2"],
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
            response: "",
        });
    });
});
