import React from "react";
import { NoDomUploady } from "@rpldy/shared-ui";
import NativeUploady from "../index";

vi.mock("@rpldy/shared-ui", () => ({
    NoDomUploady: vi.fn(() => <div/>),
}));

describe("NativeUploady tests", () => {
    it("should render NativeUploady", () => {
        render(<NativeUploady debug autoUpload/>);

        expect(NoDomUploady).toHaveBeenCalledWith({ debug: true, autoUpload: true }, undefined);
    });
});
