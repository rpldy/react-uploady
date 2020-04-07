import React from "react";
import { logger, invariant } from "@rpldy/shared/src/tests/mocks/rpldy-shared.mock";
import {
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
            invariant,
        )
    });

    it("should render Uploady successfully", () => {

        uploader.getOptions.mockReturnValueOnce({
            inputFieldName: "file",
        });

        const listeners = [1, 2, 3];
        const wrapper = mount(<Uploady
            debug
            accept={".doc"}
            capture="user"
            multiple
            listeners={listeners}
            autoUpload
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
        expect(input).toHaveProp("capture", "user");
        expect(input).toHaveProp("accept", ".doc");

        expect(useUploader).toHaveBeenCalledWith({ autoUpload: true }, listeners);
    });

    it("should use provided container for file input", () => {

        uploader.getOptions.mockReturnValueOnce({
            inputFieldName: "file",
        });

        const div = document.createElement("div");
        document.body.appendChild(div);

        const wrapper = mount(<Uploady inputFieldContainer={div}/>);

        expect(invariant).toHaveBeenCalledWith(
            true,
            expect.any(String)
        );

        const input = wrapper.find("input");

        expect(input).toHaveLength(1);
        expect(wrapper.find("Portal").props().containerInfo).toBe(div);
    });

    it("should show error in case no valid container", () => {

        uploader.getOptions.mockReturnValueOnce({
            inputFieldContainer: true,
        });

        mount(<Uploady inputFieldContainer/>);

        expect(invariant).toHaveBeenCalledWith(
            false,
            expect.any(String)
        );
    });

    it("should work with customInput", () => {

        const wrapper = mount(<Uploady customInput/>);

        expect(wrapper.find("input")).toHaveLength(0);
    });
});
