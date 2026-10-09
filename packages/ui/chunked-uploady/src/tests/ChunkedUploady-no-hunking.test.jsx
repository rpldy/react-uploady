import React from "react";
import { logWarning } from "@rpldy/shared-ui/src/tests/mocks/rpldy-ui-shared.mock";
import "@rpldy/uploady/src/tests/mocks/rpldy-uploady.mock";
import getChunkedEnhancer from "@rpldy/chunked-sender";
import ChunkedUploady from "../ChunkedUploady";

vi.mock("@rpldy/chunked-sender", () => ({
    default: vi.fn(),
    CHUNKING_SUPPORT: false
}));

// calls made on module import - captured before mocks are cleared for each test
const logWarningCalls = [...logWarning.mock.calls];


describe("ChunkedUploady tests without chunking support", () => {
    const chunkedEnhancer = (uploader) => uploader;

    beforeAll(() => {
        getChunkedEnhancer.mockImplementation(() => chunkedEnhancer);
    });

    it("should render Uploady when no chunk support", () => {
        render(<ChunkedUploady/>);

        expect(logWarningCalls).toContainEqual([false, expect.any(String)]);
        expect(getChunkedEnhancer).not.toHaveBeenCalled();
    });
});
