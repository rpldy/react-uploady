import React from "react";
import usePreviewsLoader from "../usePreviewsLoader";
import { getFallbackUrl } from "../utils";
import UploadPreview from "../UploadPreview";
import { PREVIEW_TYPES } from "../consts";

jest.mock("../usePreviewsLoader", () => jest.fn());

jest.mock("../utils", () => ({
    getFallbackUrl: jest.fn(),
}));

describe("UploadPreview tests", () => {

    beforeEach(() => {
        clearJestMocks(
            getFallbackUrl,
        );
    });

    it("should render with simple img preview", () => {

        usePreviewsLoader.mockReturnValueOnce({previews: [
            { url: "test.com", props: { "data-test": "123" } },
            { url: "test2.com", props: { "data-test": "456" } },
        ]});

        const wrapper = mount(<UploadPreview/>);

        const imgs = wrapper.find("img");

        expect(imgs.at(0)).toHaveProp("src", "test.com");
        expect(imgs.at(0)).toHaveProp("data-test", "123");

        expect(imgs.at(1)).toHaveProp("src", "test2.com");
        expect(imgs.at(1)).toHaveProp("data-test", "456");
    });

    it("should render with simple video preview", () => {

        usePreviewsLoader.mockReturnValueOnce({previews: [{
            url: "video.mp4",
            type: PREVIEW_TYPES.VIDEO,
        }]});

        const wrapper = mount(<UploadPreview/>);

        const videos = wrapper.find("video");

        expect(videos.at(0)).toHaveProp("src", "video.mp4");
    });

    it("should render with PreviewComponent from props", () => {

        const PreviewComp = (props) => {
			// eslint-disable-next-line no-unused-vars
            const { url, type, isFallback, ...previewProps } = props;
            return <article data-preview-type={type} {...previewProps}>
                {url}
            </article>;
        };

        usePreviewsLoader.mockReturnValueOnce({previews: [
            { url: "test.com", type: "img", props: { "data-test": "123" } },
            { url: "test2.com", type: "img", props: { "data-test": "456" } },
        ]});

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

        usePreviewsLoader.mockReturnValueOnce({previews: [
            { url: previewUrl, type: "img", props: { "data-test": "123" } },
        ]});

        const wrapper = mount(<UploadPreview
            fallbackUrl={fbUrl}/>);

        getFallbackUrl.mockReturnValueOnce({ url: fbUrl });

        const img = { src: previewUrl };
        wrapper.find("img").props().onError({ target: img });
        expect(img.src).toBe(fbUrl);
        expect(getFallbackUrl).toHaveBeenCalledWith(fbUrl, previewUrl);

        wrapper.find("img").props().onError({ target: img });
        expect(img.src).toBe(fbUrl);
    });

	it("should provide methods ref and call onPreviewsChanged", () => {

		const previews =  [
			{ url: "test.com", props: { "data-test": "123" } },
			{ url: "test2.com", props: { "data-test": "456" } },
		];

		usePreviewsLoader.mockReturnValueOnce({previews, clearPreviews: "clear"});

		const onPreviewsChanged = jest.fn();

		const methodsRef = {current: null};

		mount(<UploadPreview
			onPreviewsChanged={onPreviewsChanged}
			previewMethodsRef={methodsRef}
		/>);

		expect(onPreviewsChanged).toHaveBeenCalledWith(previews);

		expect(methodsRef.current.clear).toBe("clear");
	});

	it("should provide isFallback to custom preview component", () => {

		usePreviewsLoader.mockReturnValueOnce({previews: [{isFallback: true, url: "fallback.com"}]});

		const PreviewComp = (props) => {
			const { url, isFallback, ...previewProps } = props;
			return <article data-fallback={isFallback} {...previewProps}>
				{url}
			</article>;
		};

		const wrapper = mount(<UploadPreview
			PreviewComponent={PreviewComp}/>);

		expect(wrapper.find("article")).toHaveProp("data-fallback", true);
	});
});

