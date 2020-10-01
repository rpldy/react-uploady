import React from "react";
import { invariant } from "@rpldy/shared/src/tests/mocks/rpldy-shared.mock";
import { hasWindow } from "@rpldy/shared";
import {
    useUploadOptions,
} from "@rpldy/shared-ui/src/tests/mocks/rpldy-ui-shared.mock";
import Uploady from "../Uploady";

describe("Uploady tests", () => {

    beforeEach(() => {
        clearJestMocks(
            useUploadOptions,
            invariant,
        );
    });

    it("should render Uploady successfully", () => {
        hasWindow.mockReturnValueOnce(true);

        useUploadOptions.mockReturnValueOnce({
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

        expect(wrapper.find("#test")).toHaveLength(1);

        const input = wrapper.find("Portal").find("input");

        expect(input).toHaveLength(1);
        expect(input).toHaveProp("multiple", true);
        expect(input).toHaveProp("name", "file");
        expect(input).toHaveProp("capture", "user");
        expect(input).toHaveProp("accept", ".doc");
    });

    it("should use provided container for file input", () => {

        useUploadOptions.mockReturnValueOnce({
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
        hasWindow.mockReturnValueOnce(true);

        useUploadOptions.mockReturnValueOnce({
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

    it("should respect noPortal", () => {

        useUploadOptions.mockReturnValueOnce({
            inputFieldName: "file",
        });

        const wrapper = mount(<Uploady noPortal
                                       multiple
                                       accept={".doc"}>
            <div id="test"/>
        </Uploady>);

        expect(wrapper.find("Portal").find("input")).toHaveLength(0);

        const input = wrapper.find("input");
        expect(input).toHaveLength(1);
        expect(input).toHaveProp("multiple", true);
        expect(input).toHaveProp("name", "file");
    });
});
