import { createContextApi } from "../UploadyContext";

describe("UploadyContext tests", () => {

    const uploader = {
        add: jest.fn(),
    };

    const getTestContext = (inputRef) => {

        inputRef = inputRef || { current: {} };
        return createContextApi(uploader, { inputRef })
    };


    it("should call upload on uploader", () => {

        const contextApi = getTestContext();

        const files = [1, 2],
            options = { multiple: true };

        contextApi.upload(files, options);

        expect(uploader.add).toHaveBeenCalledWith(files, options);
    });

});


