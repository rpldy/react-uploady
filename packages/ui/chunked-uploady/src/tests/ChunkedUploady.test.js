import React from "react";

describe("ChunkedUploady tests", () => {

    let Uploady, composeEnhancers, ChunkedUploady, logWarning;
    const chunkedEnhancer = (uploader) => uploader;

    const mockGetChunkedEnhancer = jest.fn(() => chunkedEnhancer);

    afterEach(() => {
        clearJestMocks(
            mockGetChunkedEnhancer,
            logWarning,
        );
    });

    const doTest = (testFn, mockChunkSupport = true) => {
        jest.isolateModules(() => {

            mockGetChunkedEnhancer.CHUNKING_SUPPORT = mockChunkSupport;
            jest.mock("@rpldy/chunked-sender", () => mockGetChunkedEnhancer);

            logWarning = require("@rpldy/shared-ui/src/tests/mocks/rpldy-ui-shared.mock").logWarning;

            Uploady = require("@rpldy/uploady/src/tests/mocks/rpldy-uploady.mock").default;
            composeEnhancers = Uploady.composeEnhancers;

            ChunkedUploady = require("../ChunkedUploady").default;

            testFn();
        });
    };

    it("should render ChunkedUploady with enhancer", () => {
        doTest(() => {
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
            expect(mockGetChunkedEnhancer).toHaveBeenCalledWith(chunkedProps);
        });
    });

    it("should render ChunkedUploady without enhancer", () => {
        doTest(() => {
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

    it("should render Uploady when no chunk support", () => {
        doTest(() => {
            shallow(<ChunkedUploady/>);

            expect(logWarning).toHaveBeenCalledWith(false, expect.any(String));
            expect(mockGetChunkedEnhancer).not.toHaveBeenCalled();

        }, false);
    });
});
