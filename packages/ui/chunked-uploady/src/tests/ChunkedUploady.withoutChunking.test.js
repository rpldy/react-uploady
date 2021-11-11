import React from "react";
import { logWarning } from "@rpldy/shared-ui/src/tests/mocks/rpldy-ui-shared.mock";
import "@rpldy/uploady/src/tests/mocks/rpldy-uploady.mock";
import getChunkedEnhancer from "@rpldy/chunked-sender";
import ChunkedUploady from "../ChunkedUploady";

jest.mock("@rpldy/chunked-sender", () => {
    const fn = jest.fn();
    fn.CHUNKING_SUPPORT = false;
    return fn;
});

describe("ChunkedUploady tests without chunking support", () => {
    const chunkedEnhancer = (uploader) => uploader;

    beforeAll(() => {
        getChunkedEnhancer.mockImplementation(() => chunkedEnhancer);
    });

    it("should render Uploady when no chunk support", () => {
        shallow(<ChunkedUploady/>);

        expect(logWarning).toHaveBeenCalledWith(false, expect.any(String));
        expect(getChunkedEnhancer).not.toHaveBeenCalled();
    });
});
