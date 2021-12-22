import React from "react";
import { logger } from "@rpldy/shared/src/tests/mocks/rpldy-shared.mock";
import useUploader from "../hooks/useUploader";
import NoDomUploady from "../NoDomUploady";
import { createContextApi } from "../UploadyContext";

jest.mock("../UploadyContext", () => require("./mocks/UploadyContext.mock").default);

jest.mock("../hooks/useUploader", () => jest.fn());

describe("Uploady tests", () => {

    const uploader = {};

    beforeEach(() => {
        useUploader.mockReturnValueOnce(uploader);

        clearJestMocks(
            uploader.getOptions,
            uploader.add,
        );
    });

    it("should render Uploady successfully", () => {

        const inputRef = "inputRef";

        const listeners = [1, 2, 3];
        const wrapper = mount(<NoDomUploady
            debug
            listeners={listeners}
            autoUpload
            inputRef={inputRef}
        >
            <div id="test"/>
        </NoDomUploady>);

        expect(logger.setDebug).toHaveBeenCalledWith(true);
        expect(createContextApi).toHaveBeenCalledWith(uploader, inputRef);

        expect(wrapper.find("#test")).toHaveLength(1);

        expect(useUploader).toHaveBeenCalledWith({ autoUpload: true }, listeners);
    });
});
