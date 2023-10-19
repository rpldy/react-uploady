import React from "react";
import { UploadyContext } from "@rpldy/shared-ui/src/tests/mocks/rpldy-ui-shared.mock";
import UploadUrlInput from "./UploadUrlInput";

describe("UploadUrlInput tests", () => {
    beforeEach(() => {
        UploadyContext.upload.mockClear();
    });

    const renderInput = (props = {}) => {
        const user = userEvent.setup();

        render(<UploadUrlInput
            id="uploadInput"
            {...props}
        />);

        const input = document.getElementById("uploadInput");
        input.focus();

        return {
            user,
            input,
        };
    };

    it("should render and upload on enter", async () => {
        const value = "http://test.com";

        const { input, user } = renderInput({
            className: "test-input",
            placeholder: "upload url",
            autoUpload: true,
        });

        input.value = value;

        expect(input).to.have.attr("class", "test-input");
        expect(input).to.have.attr("placeholder", "upload url");

        await user.keyboard("{Enter}");

        expect(UploadyContext.upload).toHaveBeenCalledWith(value, {
            autoUpload: true
        });
    });

    it("should not upload for other key presses", async () => {
        const { user } = renderInput();

        await user.keyboard("{Shift}");
        expect(UploadyContext.upload).not.toHaveBeenCalled();

        await user.keyboard("aaa");
        expect(UploadyContext.upload).not.toHaveBeenCalled();
    });

    it("should not upload if ignoreKeyPress = true", async () => {
        const { user } = renderInput({ ignoreKeyPress: true });

        await user.keyboard("{Enter}");

        expect(UploadyContext.upload).not.toHaveBeenCalled();
    });

    it("should not upload if validate fails", async () => {
        const value = "http://test.com";
        let counter = 0;

        const validate = (inputValue, input) => {
            expect(inputValue).toBe(value);
            expect(input).toBeTruthy();
            counter += 1;
            return !!(counter - 1);
        };

        const { input, user } = renderInput({ validate });

        input.value = value;
        await user.keyboard("{Enter}");
        expect(UploadyContext.upload).not.toHaveBeenCalled();
    });

    it("should upload if validate succeeds", async() => {
        const value = "http://test.com";
        const mockRef = vi.fn();
        const validate = () => true;

        const { user } = renderInput({ validate,autoUpload: true, ref: mockRef });

        expect(mockRef).toHaveBeenCalled();
        mockRef.mock.calls[0][0].value = value;

        await user.keyboard("{Enter}");
        expect(UploadyContext.upload).toHaveBeenCalledWith(value, {
            autoUpload: true
        });
    });

    it("should upload using uploadRef", () => {
        const value = "http://test.com";
        const uploadRef = vi.fn();
        const mockRef = vi.fn();

        renderInput({ autoUpload: true, ref: mockRef, uploadRef });

        mockRef.mock.calls[0][0].value = value;
        uploadRef.mock.calls[0][0]();

        expect(UploadyContext.upload).toHaveBeenCalledWith(value, {
            autoUpload: true
        });
    });
});
