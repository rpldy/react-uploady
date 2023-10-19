import React from "react";
import { logWarning } from "@rpldy/shared-ui/src/tests/mocks/rpldy-ui-shared.mock";
import Uploady, { composeEnhancers } from "@rpldy/uploady/src/tests/mocks/rpldy-uploady.mock";
import getChunkedEnhancer from "@rpldy/chunked-sender";
import ChunkedUploady from "../ChunkedUploady";

vi.mock("@rpldy/chunked-sender", () => ({
    default: vi.fn(),
    CHUNKING_SUPPORT: true
}));

describe("ChunkedUploady tests with chunking support", () => {
    const chunkedEnhancer = (uploader) => uploader;

    beforeEach(() => {
        clearViMocks(
            Uploady,
        );
    });

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

        const enhancer = vi.fn((uploader) => uploader);

        const props = {
            enhancer,
            ...chunkedProps,
        };

        composeEnhancers.mockReturnValueOnce(enhancer);

        render(<ChunkedUploady {...props} />);

        expect(Uploady).toHaveBeenCalledOnce();

        const update = vi.fn();
        const uploader = enhancer({
            update,
        });

        expect(uploader).toBeDefined();
        expect(composeEnhancers).toHaveBeenCalledWith(chunkedEnhancer, enhancer);

        expect(logWarning).toHaveBeenCalledWith(true, expect.any(String));
        expect(getChunkedEnhancer).toHaveBeenCalledWith(chunkedProps);
    });

    it("should render ChunkedUploady without enhancer", () => {
        render(<ChunkedUploady/>);

        const enhancer = Uploady.mock.calls[0][0].enhancer;

        const update = vi.fn();
        const uploader = {
            update,
        };

        const enhancedUploader = enhancer(uploader);
        expect(enhancedUploader).toBe(uploader);
    });
});
