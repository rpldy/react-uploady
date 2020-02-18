import React from "react";
import { logger } from "@rpldy/shared/src/tests/mocks/rpldy-shared.mock";
import {
    UploadyContext,
    createContextApi
} from "@rpldy/shared-ui/src/tests/mocks/rpldy-ui-shared.mock";
import useUploader from "../useUploader";
import Uploady from "../Uploady";

jest.mock("../useUploader", () => jest.fn());

describe("Uploady tests", () => {

    const uploader = {
            getOptions: jest.fn(),
            add: jest.fn(),
        };

    beforeEach(() => {
        useUploader.mockReturnValueOnce(uploader);

        clearJestMocks(
            uploader.getOptions,
            uploader.add,
        )
    });

    it("should render Uploady successfully", () => {

        uploader.getOptions.mockReturnValueOnce({
            multiple: true,
            inputFieldName: "file",
        });

        const wrapper = mount(<Uploady
            debug
        >
            <div id="test"/>
        </Uploady>);

        expect(logger.setDebug).toHaveBeenCalledWith(true);
        expect(createContextApi).toHaveBeenCalledWith(uploader, expect.any(Object))

        expect(wrapper.find("#test")).toHaveLength(1);

        const input = wrapper.find("input");

        expect(input).toHaveLength(1);
        expect(input).toHaveProp("multiple", true);
        expect(input).toHaveProp("name", "file");

        input.props().onChange({
            target: {
                files: [1, 2]
            }
        });

        expect(uploader.add).toHaveBeenCalledWith([1, 2]);
    });
});
