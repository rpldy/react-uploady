import React from "react";
import usePreviewsLoader from "../usePreviewsLoader";
import { getFallbackUrl } from "../utils";
import UploadPreview from "../UploadPreview";

jest.mock("../usePreviewsLoader", () => jest.fn());

jest.mock("../utils", () => ({
    getFallbackUrl: jest.fn(),
}));

describe("UploadPreview tests", () => {

    beforeEach(() => {
        clearJestMocks(
            getFallbackUrl,
        )
    });

    it("should render with simple img preview", () => {

        usePreviewsLoader.mockReturnValueOnce([
            { url: "test.com", props: { "data-test": "123" } },
            { url: "test2.com", props: { "data-test": "456" } },
        ]);

        const wrapper = mount(<UploadPreview/>);

        const imgs = wrapper.find("img");

        expect(imgs.at(0)).toHaveProp("src", "test.com");
        expect(imgs.at(0)).toHaveProp("data-test", "123");

        expect(imgs.at(1)).toHaveProp("src", "test2.com");
        expect(imgs.at(1)).toHaveProp("data-test", "456");
    });

    it("should render with PreviewComponent from props", () => {

        const PreviewComp = (props) => {
            const { url, type, ...previewProps } = props;
            return <article data-preview-type={type} {...previewProps}>
                {url}
            </article>;
        };

        usePreviewsLoader.mockReturnValueOnce([
            { url: "test.com", type: "img", props: { "data-test": "123" } },
            { url: "test2.com", type: "img", props: { "data-test": "456" } },
        ]);

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

        usePreviewsLoader.mockReturnValueOnce([
            { url: previewUrl, type: "img", props: { "data-test": "123" } },
        ]);

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
});

