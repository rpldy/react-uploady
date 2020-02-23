import React from "react";
import { UploadyContext } from "@rpldy/shared-ui/src/tests/mocks/rpldy-ui-shared.mock";
import UploadButton from "./UploadButton";

describe("<UploadButton> tests", () => {

    it("should render button with defaults", () => {

        const wrapper = shallow(<UploadButton
            id={"test"}
            className={"styles"}
        />);

        expect(wrapper).toHaveProp("id", "test");
        expect(wrapper).toHaveProp("className", "styles");
        expect(wrapper).toHaveText("Upload");
    });

    it("should show file upload on click", () => {
        const wrapper = shallow(<UploadButton
            multiple
            autoUpload
        />);

        wrapper.simulate("click");

        expect(UploadyContext.showFileUpload).toHaveBeenCalledWith({
            multiple: true,
            autoUpload: true,
        });
    });

    it("should render custom children", () => {

        const wrapper = shallow(<UploadButton text="test">
            <div>custom</div>
        </UploadButton>);

        expect(wrapper.find("div")).toHaveLength(1);
        expect(wrapper.find("div")).toHaveText("custom");
        expect(wrapper).not.toHaveText("Upload");
        expect(wrapper).not.toHaveText("test");
    });

    it("should render custom text", () => {
        const wrapper = shallow(<UploadButton text="test"/>);
        expect(wrapper).toHaveText("test");
    });

});
