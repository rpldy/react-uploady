import React from "react";
import { logWarning } from "@rpldy/shared-ui/src/tests/mocks/rpldy-ui-shared.mock";
import "@rpldy/uploady/src/tests/mocks/rpldy-uploady.mock";
import TusUploady from "../TusUploady";
import { getTusEnhancer } from "@rpldy/tus-sender";

jest.mock("@rpldy/tus-sender", () => ({
    getTusEnhancer: jest.fn(),
    CHUNKING_SUPPORT: false
}));

describe("test TusUploady without chucking support", () => {
    it("should render Uploady when no chunk support", () => {
        shallow(<TusUploady/>);

        expect(logWarning).toHaveBeenCalledWith(false, expect.any(String));
        expect(getTusEnhancer).not.toHaveBeenCalled();
    });
});
