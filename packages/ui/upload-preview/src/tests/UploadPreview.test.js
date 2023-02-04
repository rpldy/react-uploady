import React from "react";
import { getPreviewsLoaderHook } from "../usePreviewsLoader";
import { getFallbackUrlData } from "../utils";
import { PREVIEW_TYPES } from "../consts";

jest.mock("../usePreviewsLoader", () => ({
    getPreviewsLoaderHook: jest.fn()
}));

jest.mock("../utils", () => ({
    getFallbackUrlData: jest.fn(),
}));

describe("UploadPreview tests", () => {
    const mockUsePreviewsLoader = jest.fn();
    let UploadPreview, getUploadPreviewForBatchItemsMethod;

    beforeAll(() => {
        getPreviewsLoaderHook.mockReturnValue(mockUsePreviewsLoader);

        const mdl = require("../UploadPreview");
        UploadPreview = mdl.default;
        getUploadPreviewForBatchItemsMethod = mdl.getUploadPreviewForBatchItemsMethod;
    });

    beforeEach(() => {
        clearJestMocks(
            mockUsePreviewsLoader,
            getFallbackUrlData,
        );
    });

    it("should render with simple img preview", () => {
        mockUsePreviewsLoader.mockReturnValueOnce({
            previews: [
                { url: "test.com", props: { "data-test": "123" } },
                { url: "test2.com", props: { "data-test": "456" } },
            ]
        });

        const wrapper = mount(<UploadPreview/>);

        const imgs = wrapper.find("img");

        expect(imgs.at(0)).toHaveProp("src", "test.com");
        expect(imgs.at(0)).toHaveProp("data-test", "123");

        expect(imgs.at(1)).toHaveProp("src", "test2.com");
        expect(imgs.at(1)).toHaveProp("data-test", "456");
    });

    it("should render with simple video preview", () => {
        mockUsePreviewsLoader.mockReturnValueOnce({
            previews: [{
                url: "video.mp4",
                type: PREVIEW_TYPES.VIDEO,
            }]
        });

        const wrapper = mount(<UploadPreview/>);

        const videos = wrapper.find("video");

        expect(videos.at(0)).toHaveProp("src", "video.mp4");
    });

    it("should render with PreviewComponent from props", () => {
        const PreviewComp = (props) => {
            // eslint-disable-next-line no-unused-vars
            const { url, type, isFallback, removePreview, ...previewProps } = props;
            return <article data-preview-type={type} {...previewProps}>
                {url}
            </article>;
        };

        mockUsePreviewsLoader.mockReturnValueOnce({
            previews: [
                { url: "test.com", type: "img", props: { "data-test": "123" } },
                { url: "test2.com", type: "img", props: { "data-test": "456" } },
            ]
        });

        const wrapper = mount(<UploadPreview
            PreviewComponent={PreviewComp}/>);

        const articles = wrapper.find("article");

        expect(articles.at(0)).toHaveProp("data-preview-type", "img");
        expect(articles.at(0)).toHaveProp("data-test", "123");
        expect(articles.at(0)).toHaveText("test.com");

        expect(articles.at(1)).toHaveProp("data-preview-type", "img");
        expect(articles.at(1)).toHaveProp("data-test", "456");
        expect(articles.at(1)).toHaveText("test2.com");
    });

    it("should use fallback on image load error", () => {
        const previewUrl = "test.com",
            fbUrl = "fallback.com";

        mockUsePreviewsLoader.mockReturnValueOnce({
            previews: [
                { url: previewUrl, type: "img", props: { "data-test": "123" } },
            ]
        });

        const wrapper = mount(<UploadPreview
            fallbackUrl={fbUrl}/>);

        getFallbackUrlData.mockReturnValueOnce({ url: fbUrl });

        const img = { src: previewUrl };
        wrapper.find("img").props().onError({ target: img });
        expect(img.src).toBe(fbUrl);
        expect(getFallbackUrlData).toHaveBeenCalledWith(fbUrl, previewUrl);

        wrapper.find("img").props().onError({ target: img });
        expect(img.src).toBe(fbUrl);
    });

    it("should provide methods ref and call onPreviewsChanged", () => {
        const previews = [
            { url: "test.com", props: { "data-test": "123" } },
            { url: "test2.com", props: { "data-test": "456" } },
        ];

        mockUsePreviewsLoader.mockReturnValueOnce({
            previews,
            clearPreviews: "clear",
            removeItemFromPreview: "removeP",
        });

        const onPreviewsChanged = jest.fn();

        const methodsRef = { current: null };

        mount(<UploadPreview
            onPreviewsChanged={onPreviewsChanged}
            previewMethodsRef={methodsRef}
        />);

        expect(onPreviewsChanged).toHaveBeenCalledWith(previews);

        expect(methodsRef.current.clear).toBe("clear");
        expect(methodsRef.current.removePreview).toBe("removeP");
    });

    it("should provide isFallback to custom preview component", () => {
        mockUsePreviewsLoader.mockReturnValueOnce({ previews: [{ isFallback: true, url: "fallback.com" }] });

        const PreviewComp = (props) => {
            const { url, isFallback, removePreview, ...previewProps } = props;

            return <article data-fallback={isFallback} {...previewProps} onClick={removePreview}>
                {url}
            </article>;
        };

        const wrapper = mount(<UploadPreview
            PreviewComponent={PreviewComp}
        />);

        expect(wrapper.find("article")).toHaveProp("data-fallback", true);
    });

    it("should use custom batch items method", () => {
        mockUsePreviewsLoader.mockReturnValueOnce({ previews: [] });

        const customBatchItemsMethod = () => {};

        const CustomUploadPreview = getUploadPreviewForBatchItemsMethod(customBatchItemsMethod);

        mount(<CustomUploadPreview/>);

        expect(getPreviewsLoaderHook).toHaveBeenLastCalledWith(customBatchItemsMethod);
    });
});

