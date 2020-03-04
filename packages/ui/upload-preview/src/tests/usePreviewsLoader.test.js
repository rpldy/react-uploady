import testCustomHook from "test/testCustomHook";
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
            .mockReturnValueOnce({url: "preview.test"});

        const { getHookResult } = testPreviewsLoader({
            loadFirstOnly: true,
        });

        const previews = getHookResult();

        expect(previews).toHaveLength(1);
        expect(previews[0].url).toBe("preview.test");
        expect(previews[0].props).toBeUndefined();
    });

    it("should load preview for all items in batch", () => {
        getFileObjectUrlByType
            .mockReturnValueOnce({url: "preview.test"});

        const { getHookResult, items } = testPreviewsLoader();

        const previews = getHookResult();

        expect(previews).toHaveLength(2);
        expect(previews[0].url).toBe("preview.test");
        expect(previews[1].url).toBe(items[1].url);
    });

    it("should use previewComponentProps as a function", () => {

        getFileObjectUrlByType
            .mockReturnValueOnce({url: "preview.test", type: "img"});

        const { getHookResult, items } = testPreviewsLoader({
            previewComponentProps: (item, url, type) => ({
                test: `${item.id}-${url}-${type}`
            }),
        });

        const previews = getHookResult();

        expect(previews).toHaveLength(2);
        expect(previews[0].url).toBe("preview.test");
        expect(previews[0].props).toEqual({test: "f1-preview.test-img"});
        expect(previews[1].props).toEqual({test: `u2-${items[1].url}-${PREVIEW_TYPES.IMAGE}`});
    });

    it("should use previewComponentProps as an object", () => {
        getFileObjectUrlByType
            .mockReturnValueOnce({url: "preview.test", type: "img"});

        const { getHookResult } = testPreviewsLoader({
            previewComponentProps: {test: "123"}
        });

        const previews = getHookResult();

        expect(previews).toHaveLength(2);
        expect(previews[0].url).toBe("preview.test");
        expect(previews[0].props).toEqual({test: "123"});
        expect(previews[1].props).toEqual({test: "123"});
    });

    it("should return preview for video", () => {

        getFileObjectUrlByType
            .mockReturnValueOnce(null)
            .mockReturnValueOnce({url: "video.test", type: "video"});

        const { getHookResult, items } = testPreviewsLoader({
            previewComponentProps: (item, url, type) => ({
                test: `${item.id}-${url}-${type}`
            }),
        });

        const previews = getHookResult();

        expect(previews).toHaveLength(2);
        expect(previews[0].url).toBe("video.test");
        expect(previews[0].props).toEqual({test: "f1-video.test-video"});
        expect(previews[1].props).toEqual({test: `u2-${items[1].url}-${PREVIEW_TYPES.IMAGE}`});
    });

    it("should return fallback url", () => {

        getFallbackUrl.mockReturnValueOnce({url: "fallback.test", type: "fallback"});

        const { getHookResult, items, props } = testPreviewsLoader({
            fallbackUrl: "external fallback",
            previewComponentProps: (item, url, type) => ({
                test: `${item.id}-${url}-${type}`
            }),
        }, [ { id: "f1", file: {name: "test"} }]);

        const previews = getHookResult();

        expect(previews).toHaveLength(1);
        expect(previews[0].url).toBe("fallback.test");
        expect(previews[0].props).toEqual({test: "f1-fallback.test-fallback"});

        expect(getFallbackUrl).toHaveBeenCalledWith(props.fallbackUrl, items[0].file);
    });

    it("should filter preview if no fallback url", () => {

        getFallbackUrl.mockReturnValueOnce(null);

        const { getHookResult, items } = testPreviewsLoader();

        const previews = getHookResult();
        expect(previews).toHaveLength(1);
        expect(previews[0].url).toBe(items[1].url);
    });
});
