import React from "react";
import { logWarning } from "@rpldy/shared-ui/src/tests/mocks/rpldy-ui-shared.mock";
import Uploady, { composeEnhancers } from "@rpldy/uploady/src/tests/mocks/rpldy-uploady.mock";
import TusUploady from "../TusUploady";
import { getTusEnhancer } from "@rpldy/tus-sender";

vi.mock("@rpldy/tus-sender", () => ({
    getTusEnhancer: vi.fn(),
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

        const enhancer = vi.fn((uploader) => uploader);

        const props = {
            enhancer,
            ...tusProps,
        };

        composeEnhancers.mockReturnValueOnce(enhancer);

        const { container } = render(<TusUploady {...props} />);

        const UploadyElm = container.firstChild;

        expect(UploadyElm).toBeDefined();

        const update = vi.fn();
        const uploader = enhancer({
            update,
        });

        expect(uploader).toBeDefined();
        expect(composeEnhancers).toHaveBeenCalledWith(tusEnhancer, enhancer);

        expect(logWarning).toHaveBeenCalledWith(true, expect.any(String));
        expect(getTusEnhancer).toHaveBeenCalledWith(tusProps);
    });

    it("should render ChunkedUploady without enhancer", () => {
        render(<TusUploady/>);

        const enhancer = Uploady.mock.calls[0][0].enhancer;

        const update = vi.fn();
        const uploader = {
            update,
        };

        const enhancedUploader = enhancer(uploader);
        expect(enhancedUploader).toBe(uploader);
    });
});
