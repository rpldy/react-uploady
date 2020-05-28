import { getUploadMetadata } from "../utils";

describe("utils tests", () => {
	describe("getUploadMetadata tests", () => {
		it("should return undefined if no params", () => {
			expect(getUploadMetadata({})).toBeUndefined();
		});

		it("should return undefined if empty params", () => {
			expect(getUploadMetadata({ params: {} })).toBeUndefined();
		});

		it("should return encoded string for params", () => {
			const options = { params: { test: "a", foo: "bar", "empty": "" } };
			expect(getUploadMetadata(options)).toBe("test YQ==,foo YmFy,empty ");
		});
	});
});