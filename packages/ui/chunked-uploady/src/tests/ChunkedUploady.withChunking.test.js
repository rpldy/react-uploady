import React from "react";
import { logWarning } from "@rpldy/shared-ui/src/tests/mocks/rpldy-ui-shared.mock";
import Uploady, { composeEnhancers } from "@rpldy/uploady/src/tests/mocks/rpldy-uploady.mock";
import getChunkedEnhancer from "@rpldy/chunked-sender";
import ChunkedUploady from "../ChunkedUploady";

jest.mock("@rpldy/chunked-sender", () => {
    const fn = jest.fn();
    fn.CHUNKING_SUPPORT = true;
    return fn;
});

describe("ChunkedUploady tests with chunking support", () => {
    const chunkedEnhancer = (uploader) => uploader;

    beforeAll(() => {
        getChunkedEnhancer.mockImplementation(() => chunkedEnhancer);
    });

    it("should render ChunkedUploady with enhancer", () => {
        const chunkedProps = {
            chunked: true,
            chunkSize: 11,
            retries: 7,
            parallel: 3,
        };

        const enhancer = jest.fn((uploader) => uploader);

        const props = {
            enhancer,
            ...chunkedProps,
        };

        composeEnhancers.mockReturnValueOnce(enhancer);

        const wrapper = shallow(<ChunkedUploady {...props} />);

        const UploadyElm = wrapper.find(Uploady);

        expect(UploadyElm).toHaveLength(1);

        const update = jest.fn();
        const uploader = enhancer({
            update,
        });

        expect(uploader).toBeDefined();
        expect(composeEnhancers).toHaveBeenCalledWith(chunkedEnhancer, enhancer);

        expect(logWarning).toHaveBeenCalledWith(true, expect.any(String));
        expect(getChunkedEnhancer).toHaveBeenCalledWith(chunkedProps);
    });

    it("should render ChunkedUploady without enhancer", () => {
        const wrapper = shallow(<ChunkedUploady/>);

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
