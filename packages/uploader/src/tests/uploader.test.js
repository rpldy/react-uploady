jest.mock("../batch", () => jest.fn());
jest.mock("../processor", () => jest.fn());
import { triggerCancellable } from "@rpldy/shared/src/tests/mocks/rpldy-shared.mock";
import mockCreateProcessor from "../processor";
import mockCreateBatch from "../batch";
import createUploader from "../uploader";

describe("uploader tests", () => {

	const mockProcess = jest.fn();

	beforeEach(() => {
		clearJestMocks(mockProcess);
	});

	const getTestUploader = (options) => {

		options = {
			destination: { url: "aaa" },
			...options
		};

		mockCreateProcessor.mockReturnValueOnce({
			process: mockProcess,
		});

		return createUploader(options);
	};

	describe("getOptions tests", () => {

		it("should return combination of passed options with defaults", () => {

			const uploader = createUploader({
				multiple: false,
				autoUpload: false,
			});

			const options = uploader.getOptions();

			expect(options.multiple).toBe(false);
			expect(options.autoUpload).toBe(false);
			expect(options.maxConcurrent).toBe(2);
			expect(options.maxGroupSize).toBe(5);
		});

		it("should get a deep clone", () => {

			const uploader = createUploader({
				multiple: false,
				autoUpload: false,
				destination: {
					url: "test-url"
				},
			});

			const options = uploader.getOptions();

			options.multiple = true;
			options.destination.url = "test2";

			const options2 = uploader.getOptions();

			expect(options2.multiple).toBe(false);
			expect(options2.destination.url).toBe("test-url");

		});
	});

	describe("updateOptions tests", () => {

		it("should update options", () => {
			// const uploader = createUploader({ destination: { url: "aaa" } });
			const uploader = getTestUploader();

			expect(uploader.getOptions().autoUpload).toBe(true);
			uploader.update({ autoUpload: false, destination: { filesParamName: "bbb" } });
			expect(uploader.getOptions().autoUpload).toBe(false);
			expect(uploader.getOptions().destination).toEqual({
				url: "aaa",
				params: {},
				filesParamName: "bbb",
			});
		});
	});

	describe("pending uploads tests", () => {

		it("get pending should return pending batches",async () => {

			triggerCancellable
				.mockReturnValueOnce(() => Promise.resolve(false));

			const uploader = getTestUploader({ autoUpload: false }); //createUploader({ autoUpload: false, destination: { url: "aaa" } });

			mockCreateBatch
				.mockReturnValueOnce("batch1")
				.mockReturnValueOnce("batch2");

			await uploader.add([], { test: 1 });
			await uploader.add([], { test: 2 });

			const pending = uploader.getPending();

			expect(pending[0].batch).toBe("batch1");
			expect(pending[0].uploadOptions).toEqual(expect.objectContaining({ test: 1 }));

			expect(pending[1].batch).toBe("batch2");
			expect(pending[1].uploadOptions).toEqual(expect.objectContaining({ test: 2 }));
		});


	});

});