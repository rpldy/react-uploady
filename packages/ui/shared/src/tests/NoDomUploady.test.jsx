import React from "react";
import { logger } from "@rpldy/shared/src/tests/mocks/rpldy-shared.mock";
import useUploader from "../hooks/useUploader";
import NoDomUploady from "../NoDomUploady";
import { createContextApi } from "../UploadyContext";

// vi.mock("../UploadyContext", () => require("./mocks/UploadyContext.mock").default);
vi.mock("../UploadyContext", async () => {
    const mockContext = await import("./mocks/UploadyContext.mock");
    return {
        createContextApi: vi.fn(() => mockContext.default),
        default: mockContext.default,
    };
});

vi.mock("../hooks/useUploader");

describe("Uploady tests", () => {
    const uploader = {};

    beforeEach(() => {
        useUploader.mockReturnValueOnce(uploader);

        clearViMocks(
            uploader.getOptions,
            uploader.add,
        );
    });

    it("should render NoDomUploady successfully", () => {
        const inputRef = "inputRef";

        const listeners = [1, 2, 3];
        render(<NoDomUploady
            debug
            listeners={listeners}
            autoUpload
            inputRef={inputRef}
        >
            <div id="test"/>
        </NoDomUploady>);

        expect(logger.setDebug).toHaveBeenCalledWith(true);
        expect(createContextApi).toHaveBeenCalledWith(uploader, inputRef);

        expect(document.getElementById("test")).toBeDefined();

        expect(useUploader).toHaveBeenCalledWith({ autoUpload: true }, listeners);
    });
});
