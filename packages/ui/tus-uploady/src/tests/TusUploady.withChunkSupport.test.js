import React from "react";
import { logWarning } from "@rpldy/shared-ui/src/tests/mocks/rpldy-ui-shared.mock";
import Uploady, { composeEnhancers } from "@rpldy/uploady/src/tests/mocks/rpldy-uploady.mock";
import TusUploady from "../TusUploady";
import { getTusEnhancer } from "@rpldy/tus-sender";

jest.mock("@rpldy/tus-sender", () => ({
    getTusEnhancer: jest.fn(),
    CHUNKING_SUPPORT: true
}));

describe("test TusUploady with chucking support", () => {
    const tusEnhancer = (uploader) => uploader;

    beforeAll(() => {
        getTusEnhancer.mockImplementation(() => tusEnhancer);
    });

    it("should render TusUploady with enhancer", () => {

        const tusProps = {
            chunked: true,
            chunkSize: 11,
            retries: 7,
            parallel: 3,
            deferLength: true,
            featureDetection: true,
            storagePrefix: "---"
        };

        const enhancer = jest.fn((uploader) => uploader);

        const props = {
            enhancer,
            ...tusProps,
        };

        composeEnhancers.mockReturnValueOnce(enhancer);

        const wrapper = shallow(<TusUploady {...props} />);

        const UploadyElm = wrapper.find(Uploady);

        expect(UploadyElm).toHaveLength(1);

        const update = jest.fn();
        const uploader = enhancer({
            update,
        });

        expect(uploader).toBeDefined();
        expect(composeEnhancers).toHaveBeenCalledWith(tusEnhancer, enhancer);

        expect(logWarning).toHaveBeenCalledWith(true, expect.any(String));
        expect(getTusEnhancer).toHaveBeenCalledWith(tusProps);
    });

    it("should render ChunkedUploady without enhancer", () => {
        const wrapper = shallow(<TusUploady/>);

        const UploadyElm = wrapper.find(Uploady);

        const enhancer = UploadyElm.props().enhancer;

        const update = jest.fn();
        const uploader = {
            update,
        };

        const enhancedUploader = enhancer(uploader);
        expect(enhancedUploader).toBe(uploader);
    });
});
