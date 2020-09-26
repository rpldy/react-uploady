import { safeLocalStorage } from "@rpldy/safe-storage/src/tests/mocks/safeStorage.mock";
import { DEFAULT_OPTIONS } from "../defaults";
import {
	persistResumable,
	retrieveResumable,
	removeResumable,
	clearResumables,
} from "../resumableStore";

describe("resumeableStore tests", () => {

	beforeEach(() => {
		clearJestMocks(
			persistResumable,
			retrieveResumable,
			removeResumable,
			clearResumables,
			safeLocalStorage,
		);
	});

	afterEach(() => {
		safeLocalStorage.length = 0;
	});

	const uploadUrl = "upload.url",
		item = {
			file: {
				name: "a",
				type: "b",
				size: "c",
				lastModified: "d",
			}
		};

	describe("persistResumable tests", () => {

		it("should persist url for item with default prefix", () => {
			persistResumable(item, uploadUrl, { resume: true });

			expect(safeLocalStorage.setItem)
				.toHaveBeenCalledWith(DEFAULT_OPTIONS.storagePrefix + "a/b/c/d", expect.any(String));

			expect(JSON.parse(safeLocalStorage.setItem.mock.calls[0][1]).uploadUrl).toBe(uploadUrl);
		});

		it("should do nothing if resume = false", () => {
			persistResumable({}, "upload.url", { resume: false });
			expect(safeLocalStorage.setItem).not.toHaveBeenCalled();
		});

		it("should persist url with options prefix and identifier", () => {
			persistResumable(item, uploadUrl, { resume: true, storagePrefix: "pre_" }, "123");

			expect(safeLocalStorage.setItem)
				.toHaveBeenCalledWith("pre_a/b/c/d/123", expect.any(String));
		});

		it("should persist without lastModified", () => {
			persistResumable(item, uploadUrl, { resume: true, ignoreModifiedDateInStorage: true });

			expect(safeLocalStorage.setItem)
				.toHaveBeenCalledWith(DEFAULT_OPTIONS.storagePrefix + "a/b/c", expect.any(String));

			expect(JSON.parse(safeLocalStorage.setItem.mock.calls[0][1]).uploadUrl).toBe(uploadUrl);
		});
	});

	describe("retrieveResumable tests", () => {

		it("should return stored data", () => {
			safeLocalStorage.getItem.mockReturnValueOnce(JSON.stringify({ uploadUrl: "bla.com" }));
			const url = retrieveResumable(item, { resume: true }, "123");

			expect(url).toBe("bla.com");
			expect(safeLocalStorage.getItem).toHaveBeenCalledWith(DEFAULT_OPTIONS.storagePrefix + "a/b/c/d/123");
		});

		it("should return undefined if not stored", () => {
			const url = retrieveResumable(item, { resume: true }, "123");
			expect(url).toBeUndefined();
		});

		it("should return undefined on parse error", () => {
			safeLocalStorage.getItem.mockReturnValueOnce({});
			const url = retrieveResumable(item, { resume: true });
			expect(url).toBeUndefined();
		});

		it("should return undefined if resume = false", () => {
			const url = retrieveResumable(item, {});
			expect(url).toBeUndefined();
			expect(safeLocalStorage.getItem).not.toHaveBeenCalled();
		});

		it("should return stored data without lastModified", () => {
			safeLocalStorage.getItem.mockReturnValueOnce(JSON.stringify({ uploadUrl: "bla.com" }));
			const url = retrieveResumable(item, { resume: true, ignoreModifiedDateInStorage: true }, "123");

			expect(url).toBe("bla.com");
			expect(safeLocalStorage.getItem).toHaveBeenCalledWith(DEFAULT_OPTIONS.storagePrefix + "a/b/c/123");
		});
	});

	describe("clearResumables tests", () => {
		it.each([
			"pre_",
			null
		])("clearResumables should remove all resumable items from storage with prefix: %s", (prefix) => {
			safeLocalStorage.length = 3;

			safeLocalStorage.key
				.mockReturnValueOnce((prefix || DEFAULT_OPTIONS.storagePrefix) + "123")
				.mockReturnValueOnce("something-else")
				.mockReturnValueOnce((prefix || DEFAULT_OPTIONS.storagePrefix) + "456");

			clearResumables({ storagePrefix: prefix });

			expect(safeLocalStorage.removeItem).toHaveBeenCalledTimes(2);
		});
	});

	it("removeResumable should remove stored value", () => {
		removeResumable(item, { resume: true }, "123");
		expect(safeLocalStorage.removeItem).toHaveBeenCalledWith(DEFAULT_OPTIONS.storagePrefix + "a/b/c/d/123");
	});

	it("removeResumable should remove stored value without lastModified", () => {
		removeResumable(item, { resume: true, ignoreModifiedDateInStorage: true }, "123");
		expect(safeLocalStorage.removeItem).toHaveBeenCalledWith(DEFAULT_OPTIONS.storagePrefix + "a/b/c/123");
	});
});