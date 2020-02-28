import React from "react";
import warning from "warning";
import {
    UploadyContext,
    useWithForwardRef,
    withForwardRefMock
} from "@rpldy/shared-ui/src/tests/mocks/rpldy-ui-shared.mock";
import UploadUrlInput from "./UploadUrlInput";

jest.mock('warning', () => jest.fn());
describe("UploadUrlInput tests", () => {

    beforeEach(() => {
        clearJestMocks(
            UploadyContext.upload
        );
    });
    it("should render and upload on enter", () => {

        const value = "http://test.com";

        useWithForwardRef.mockReturnValueOnce({
            ...withForwardRefMock,
            ref: { current: { value } }
        });

        const wrapper = mount(<UploadUrlInput
            id="uploadInput"
            className="test-input"
            placeholder="upload url"
            autoUpload
        />);

        const input = wrapper.find("input");
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

    it("should throw on no input ref", () => {
        useWithForwardRef.mockReturnValueOnce({
            ...withForwardRefMock,
            ref: { current: null}
        });

        const wrapper = mount(<UploadUrlInput />);

        expect(() => {
            wrapper.find("input").props().onKeyPress({ key: "Enter" });
        }).toThrow("Uploady - ");
    });

    it("should not upload if validate fails", () => {
        const value = "http://test.com";

        useWithForwardRef.mockReturnValueOnce({
            ...withForwardRefMock,
            ref: { current: { value } }
        });

        const validate = (inputValue, input) => {
            expect(inputValue).toBe(value);
            expect(input).toBeTruthy();
            return false;
        };

        const wrapper = mount(<UploadUrlInput validate={validate}/>);

        wrapper.find("input").props().onKeyPress({ key: "Enter" });

        expect(UploadyContext.upload).not.toHaveBeenCalled();
    });

    it("should upload if validate succeeds", () => {
        const value = "http://test.com";

        useWithForwardRef.mockReturnValueOnce({
            ...withForwardRefMock,
            ref: { current: { value } }
        });

        const validate = () => {
            return true;
        };

        const wrapper = mount(<UploadUrlInput
            autoUpload
            validate={validate}/>);

        wrapper.find("input").props().onKeyPress({ key: "Enter" });

        expect(UploadyContext.upload).toHaveBeenCalledWith(value, {
            autoUpload: true
        });
    });

});
