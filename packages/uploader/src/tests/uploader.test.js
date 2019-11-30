import createUploader from "../uploader";

describe("uploader tests", () => {


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

	describe("update tests", () => {

		it("should update options", () => {
			const uploader = createUploader();
			expect(uploader.getOptions().autoUpload).toBe(true);
			uploader.update({ autoUpload: false });
			expect(uploader.getOptions().autoUpload).toBe(false);
		});

	});
});