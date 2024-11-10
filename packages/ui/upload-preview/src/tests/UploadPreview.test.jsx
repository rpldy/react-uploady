import React from "react";
import { fireEvent } from "@testing-library/react";
import { getPreviewsLoaderHook, mockUsePreviewsLoader } from "../usePreviewsLoader";
import { getFallbackUrlData } from "../utils";
import { PREVIEW_TYPES } from "../consts";
import UploadPreview, { getUploadPreviewForBatchItemsMethod } from "../UploadPreview";

vi.mock("../utils");
vi.mock("../usePreviewsLoader", async () => {
    const mockUsePreviewsLoader = vi.fn();
    return {
        getPreviewsLoaderHook: vi.fn(() => mockUsePreviewsLoader),
        mockUsePreviewsLoader,
    };
});

describe("UploadPreview tests", () => {
    beforeEach(() => {
        clearViMocks(
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

        render(<UploadPreview/>);

        const imgs = document.getElementsByTagName("img");

        expect(imgs[0]).to.have.attr("src", "test.com");
        expect(imgs[0]).to.have.attr("data-test", "123");

        expect(imgs[1]).to.have.attr("src", "test2.com");
        expect(imgs[1]).to.have.attr("data-test", "456");
    });

    it("should render with simple video preview", () => {
        mockUsePreviewsLoader.mockReturnValueOnce({
            previews: [{
                url: "video.mp4",
                type: PREVIEW_TYPES.VIDEO,
            }]
        });

        render(<UploadPreview/>);

        const videos = document.getElementsByTagName("video");

        expect(videos[0]).to.have.attr("src", "video.mp4");
    });

    it("should render with PreviewComponent from props", () => {
        const PreviewComp = (props) => {
            const { url, type, ...previewProps } = props;
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

        render(<UploadPreview
            PreviewComponent={PreviewComp}
        />);

        const articles = document.getElementsByTagName("article");

        expect(articles[0]).to.have.attr("data-preview-type", "img");
        expect(articles[0]).to.have.attr("data-test", "123");
        expect(articles[0]).to.have.text("test.com");

        expect(articles[1]).to.have.attr("data-preview-type", "img");
        expect(articles[1]).to.have.attr("data-test", "456");
        expect(articles[1]).to.have.text("test2.com");
    });

    it("should use fallback on image load error", () => {
        const previewUrl = "http://test.com/",
            fbUrl = "http://fallback.com/";

        mockUsePreviewsLoader.mockReturnValueOnce({
            previews: [
                { url: previewUrl, type: "img", props: { "data-test": "123" } },
            ]
        });

        render(<UploadPreview
            fallbackUrl={fbUrl}
        />);

        getFallbackUrlData.mockReturnValueOnce({ url: fbUrl });

        const imgElm = document.getElementsByTagName("img")[0];
        fireEvent.error(imgElm);

        expect(imgElm.src).toBe(fbUrl);
        expect(getFallbackUrlData).toHaveBeenCalledWith(fbUrl, previewUrl);

        // wrapper.find("img").props().onError({ currentTarget: img });
        // expect(img.src).toBe(fbUrl);
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

        const onPreviewsChanged = vi.fn();
        const methodsRef = { current: null };

        render(<UploadPreview
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

        render(<UploadPreview
            PreviewComponent={PreviewComp}
        />);

        expect(document.getElementsByTagName("article")[0]).to.have.attr("data-fallback", "true");
    });

    it("should use custom batch items method", () => {
        mockUsePreviewsLoader.mockReturnValueOnce({ previews: [] });

        const customBatchItemsMethod = () => {
        };

        const CustomUploadPreview = getUploadPreviewForBatchItemsMethod(customBatchItemsMethod);

        render(<CustomUploadPreview/>);

        expect(getPreviewsLoaderHook).toHaveBeenLastCalledWith(customBatchItemsMethod);
    });
});
