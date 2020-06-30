import { act } from "react-dom/test-utils";
import { useBatchStartListener } from "@rpldy/shared-ui/src/tests/mocks/rpldy-ui-shared.mock";
import { getFallbackUrl, getFileObjectUrlByType } from "../utils";
import { PREVIEW_TYPES } from "../consts";
import usePreviewsLoader from "../usePreviewsLoader";

jest.mock("../utils", () => ({
	getWithMandatoryOptions: jest.fn((o) => o),
	getFallbackUrl: jest.fn(),
	getFileObjectUrlByType: jest.fn(),
}));

describe("usePreviewLoader tests", () => {
	beforeEach(() => {
		clearJestMocks(
			useBatchStartListener,
		);
	});

	const testPreviewsLoader = (props = {}, items) => {

		items = items || [
			{ id: "f1", file: {} },
			{ id: "u2", url: "upload2.test" }
		];

		const batch = {
			items
		};

		useBatchStartListener
			.mockImplementationOnce((cb) => {
				cb(batch);
			});

		const { wrapper, getHookResult } = testCustomHook(usePreviewsLoader, props);

		return {
			wrapper,
			getHookResult,
			items,
			props,
			batch,
		};
	};

	it("should load preview for first item in batch only", () => {

		getFileObjectUrlByType
			.mockReturnValueOnce({ url: "preview.test" });

		const { getHookResult } = testPreviewsLoader({
			loadFirstOnly: true,
		});

		const { previews } = getHookResult();

		expect(previews).toHaveLength(1);
		expect(previews[0].id).toBe("f1");
		expect(previews[0].url).toBe("preview.test");
		expect(previews[0].props).toBeUndefined();
	});

	it("should load preview for all items in batch", () => {
		getFileObjectUrlByType
			.mockReturnValueOnce({ url: "preview.test" });

		const { getHookResult, items } = testPreviewsLoader();

		const { previews } = getHookResult();

		expect(previews).toHaveLength(2);
		expect(previews[0].url).toBe("preview.test");
		expect(previews[1].url).toBe(items[1].url);
	});

	it("should use previewComponentProps as a function", () => {

		getFileObjectUrlByType
			.mockReturnValueOnce({ url: "preview.test", type: "img" });

		const { getHookResult, items, wrapper } = testPreviewsLoader({
			previewComponentProps: (item, url, type) => ({
				test: `${item.id}-${url}-${type}`
			}),
		});

		const { previews } = getHookResult();

		expect(previews).toHaveLength(2);
		expect(previews[0].url).toBe("preview.test");
		expect(previews[0].props).toEqual({ test: "f1-preview.test-img" });
		expect(previews[1].props).toEqual({ test: `u2-${items[1].url}-${PREVIEW_TYPES.IMAGE}` });

		const moreItems = [
			{ id: "f3", file: { name: "1" } },
			{ id: "f4", file: { name: "2" } }
		];

		const batch = { items: moreItems };

		useBatchStartListener
			.mockImplementationOnce((cb) => {
				cb(batch);
			});

		getFileObjectUrlByType
			.mockReturnValueOnce({ url: "preview3.test" , type: "img" })
			.mockReturnValueOnce({ url: "preview4.test", type: "img"  });

		wrapper.setProps({ rememberPreviousBatches: false });
		wrapper.update();

		const { previews: newPreviews } = getHookResult();
		expect(newPreviews).toHaveLength(2);
		expect(newPreviews[0].props).toEqual({ test: "f3-preview3.test-img"});
		expect(newPreviews[1].props).toEqual({ test: "f4-preview4.test-img" });
	});

	it("should use previewComponentProps as an object", () => {
		getFileObjectUrlByType
			.mockReturnValueOnce({ url: "preview.test", type: "img" });

		const { getHookResult } = testPreviewsLoader({
			previewComponentProps: { test: "123" }
		});

		const { previews } = getHookResult();

		expect(previews).toHaveLength(2);
		expect(previews[0].url).toBe("preview.test");
		expect(previews[0].props).toEqual({ test: "123" });
		expect(previews[1].props).toEqual({ test: "123" });
	});

	it("should return preview for video", () => {

		getFileObjectUrlByType
			.mockReturnValueOnce(null)
			.mockReturnValueOnce({ url: "video.test", type: "video" });

		const { getHookResult, items } = testPreviewsLoader({
			previewComponentProps: (item, url, type) => ({
				test: `${item.id}-${url}-${type}`
			}),
		});

		const { previews } = getHookResult();

		expect(previews).toHaveLength(2);
		expect(previews[0].url).toBe("video.test");
		expect(previews[0].props).toEqual({ test: "f1-video.test-video" });
		expect(previews[1].props).toEqual({ test: `u2-${items[1].url}-${PREVIEW_TYPES.IMAGE}` });
	});

	it("should return fallback url", () => {

		getFallbackUrl.mockReturnValueOnce({ url: "fallback.test", type: "fallback" });

		const { getHookResult, items, props } = testPreviewsLoader({
			fallbackUrl: "external fallback",
			previewComponentProps: (item, url, type) => ({
				test: `${item.id}-${url}-${type}`
			}),
		}, [{ id: "f1", file: { name: "test" } }]);

		const { previews } = getHookResult();

		expect(previews).toHaveLength(1);
		expect(previews[0].url).toBe("fallback.test");
		expect(previews[0].isFallback).toBe(true);
		expect(previews[0].props).toEqual({ test: "f1-fallback.test-fallback" });

		expect(getFallbackUrl).toHaveBeenCalledWith(props.fallbackUrl, items[0].file);
	});

	it("should filter preview if no fallback url", () => {

		getFallbackUrl.mockReturnValueOnce(null);

		const { getHookResult, items } = testPreviewsLoader();

		const { previews } = getHookResult();
		expect(previews).toHaveLength(1);
		expect(previews[0].url).toBe(items[1].url);
	});

	it("should remember previous batches", () => {
		getFileObjectUrlByType
			.mockReturnValueOnce({ url: "preview1.test" });

		const { getHookResult, wrapper } = testPreviewsLoader({ rememberPreviousBatches: true });
		const { previews } = getHookResult();
		expect(previews).toHaveLength(2);

		const moreItems = [
			{ id: "f3", file: { name: "1" } },
			{ id: "f4", file: { name: "2" } }
		];

		const batch = { items: moreItems };

		useBatchStartListener
			.mockImplementationOnce((cb) => {
				cb(batch);
			});

		getFileObjectUrlByType
			.mockReturnValueOnce({ url: "preview3.test" })
			.mockReturnValueOnce({ url: "preview4.test" });

		wrapper.setProps({ rememberPreviousBatches: true });
		wrapper.update();

		const { previews: newPreviews } = getHookResult();
		expect(newPreviews).toHaveLength(4);

		expect(newPreviews[0].id).toBe("f1");
		expect(newPreviews[1].id).toBe("u2");
		expect(newPreviews[2].id).toBe("f3");
		expect(newPreviews[3].id).toBe("f4");
	});

	it("clearPreviews should clear previous", () => {
		getFileObjectUrlByType
			.mockReturnValueOnce({ url: "preview1.test" });

		const { getHookResult, wrapper } = testPreviewsLoader({ rememberPreviousBatches: true });
		const { previews } = getHookResult();
		expect(previews).toHaveLength(2);

		const moreItems = [
			{ id: "f3", file: { name: "1" } },
			{ id: "f4", file: { name: "2" } }
		];

		useBatchStartListener
			.mockImplementationOnce((cb) => {
				cb({ items: moreItems });
			});

		getFileObjectUrlByType
			.mockReturnValueOnce({ url: "preview3.test" })
			.mockReturnValueOnce({ url: "preview4.test" });

		wrapper.setProps({ rememberPreviousBatches: true });
		wrapper.update();

		const { previews: newPreviews, clearPreviews } = getHookResult();
		expect(newPreviews).toHaveLength(4);

		act(() => {
			clearPreviews();
		});

		const moreItems2 = [
			{ id: "f5", file: { name: "11" } },
			{ id: "f6", file: { name: "22" } }
		];

		useBatchStartListener
			.mockImplementationOnce((cb) => {
				cb({ items: moreItems2 });
			});

		getFileObjectUrlByType
			.mockReturnValueOnce({ url: "preview5.test" })
			.mockReturnValueOnce({ url: "preview6.test" });

		wrapper.setProps({ rememberPreviousBatches: true });
		wrapper.update();

		const { previews: afterClearPreviews } = getHookResult();
		expect(afterClearPreviews).toHaveLength(2);

		expect(afterClearPreviews[0].id).toBe("f5");
		expect(afterClearPreviews[1].id).toBe("f6");
	});

	it("should dedupe recycled items and merge while keeping order", () => {
		getFileObjectUrlByType
			.mockReturnValueOnce({ url: "preview1.test" });

		const { getHookResult, wrapper } = testPreviewsLoader({ rememberPreviousBatches: true });
		const { previews } = getHookResult();
		expect(previews).toHaveLength(2);
		expect(previews[0].id).toBe("f1");
		expect(previews[0].url).toBe("preview1.test");

		const moreItems = [
			{ id: "f1", file: { name: "1" } },
			{ id: "f4", file: { name: "2" } }
		];

		const batch = { items: moreItems };

		useBatchStartListener
			.mockImplementationOnce((cb) => {
				cb(batch);
			});

		getFileObjectUrlByType
			.mockReturnValueOnce({ url: "preview3.test" })
			.mockReturnValueOnce({ url: "preview4.test" });

		wrapper.setProps({ rememberPreviousBatches: true });
		wrapper.update();

		const { previews: newPreviews } = getHookResult();
		expect(newPreviews).toHaveLength(3);

		expect(newPreviews[0].id).toBe("f1");
		expect(newPreviews[0].url).toBe("preview3.test");
		expect(newPreviews[1].id).toBe("u2");
		expect(newPreviews[1].name).toBe( "upload2.test");
		expect(newPreviews[2].id).toBe("f4");
	});
});
