import React from "react";
import { UploadyContext } from "@rpldy/shared-ui/src/tests/mocks/rpldy-ui-shared.mock";
import UploadUrlInput from "./UploadUrlInput";

describe("UploadUrlInput tests", () => {

    beforeEach(() => {
        clearJestMocks(
            UploadyContext.upload
        );
    });

    it("should render and upload on enter", () => {
        const value = "http://test.com";

        const wrapper = mount(<UploadUrlInput
            id="uploadInput"
            className="test-input"
            placeholder="upload url"
            autoUpload
        />);

        const input = wrapper.find("input");
        input.getDOMNode().value = value;

        expect(input).toHaveProp("id", "uploadInput");
        expect(input).toHaveProp("className", "test-input");
        expect(input).toHaveProp("placeholder", "upload url");

        input.props().onKeyPress({ key: "Enter" });

        expect(UploadyContext.upload).toHaveBeenCalledWith(value, {
            autoUpload: true
        });
    });

    it("should not upload for other key presses", () => {
        const wrapper = mount(<UploadUrlInput/>);

        wrapper.find("input").props().onKeyPress({ key: "1" });
        expect(UploadyContext.upload).not.toHaveBeenCalled();
    });

    it("should not upload if ignoreKeyPress = true", () => {
        const wrapper = mount(<UploadUrlInput
            ignoreKeyPress
        />);

        wrapper.find("input").props().onKeyPress({ key: "Enter" });
        expect(UploadyContext.upload).not.toHaveBeenCalled();
    });

    it("should not upload if validate fails", () => {
        const value = "http://test.com";

        const validate = (inputValue, input) => {
            expect(inputValue).toBe(value);
            expect(input).toBeTruthy();
            return false;
        };

        const wrapper = mount(<UploadUrlInput validate={validate}/>);
        wrapper.find("input").getDOMNode().value = value;
        wrapper.find("input").props().onKeyPress({ key: "Enter" });

        expect(UploadyContext.upload).not.toHaveBeenCalled();
    });

    it("should upload if validate succeeds", () => {
        const value = "http://test.com";

        const mockRef = jest.fn();

        const validate = () => {
            return true;
        };

        const wrapper = mount(<UploadUrlInput
            autoUpload ref={mockRef}
            validate={validate}/>);

        expect(mockRef).toHaveBeenCalled();
        mockRef.mock.calls[0][0].value = value;

        wrapper.find("input").props().onKeyPress({ key: "Enter" });

        expect(UploadyContext.upload).toHaveBeenCalledWith(value, {
            autoUpload: true
        });
    });

    it("should upload using uploadRef", () => {
        const value = "http://test.com";
        const uploadRef = jest.fn();
        const mockRef = jest.fn();

        mount(<UploadUrlInput
            autoUpload
            ref={mockRef}
            uploadRef={uploadRef}/>);

        mockRef.mock.calls[0][0].value = value;

        uploadRef.mock.calls[0][0]();

        expect(UploadyContext.upload).toHaveBeenCalledWith(value, {
            autoUpload: true
        });
    });
});
