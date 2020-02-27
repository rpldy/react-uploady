import warning from "warning";
import { createContextApi } from "../UploadyContext";

jest.mock("warning", () => jest.fn());

describe("UploadyContext tests", () => {

    const uploader = {
        add: jest.fn(),
    };

    const fileInput = {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        click: jest.fn(),
    };

    const getTestContext = (input) => {
        const inputRef = input === null ?
            { current: null } :
            { current: { ...fileInput, ...input } };

        return createContextApi(uploader, inputRef);
    };

    beforeEach(() => {
        clearJestMocks(
            fileInput.addEventListener,
            fileInput.removeEventListener,
            uploader.add,
        );
    });

    it("should call upload on uploader", () => {
        const contextApi = getTestContext();

        const files = [1, 2],
            options = { multiple: true };

        contextApi.upload(files, options);

        expect(uploader.add).toHaveBeenCalledWith(files, options);
    });

    describe("input file upload tests", () => {
        it("should throw if no file input", () => {
            const contextApi = getTestContext(null);

            contextApi.showFileUpload();

            expect(warning).toHaveBeenCalledWith(
                null,
                expect.any(String)
            )
        });

        it("should handle file input change with upload options", () => {

            const files = [1, 2];
            const contextApi = getTestContext({ files });
            const options = { autoUpload: true };
            contextApi.showFileUpload(options);

            expect(fileInput.removeEventListener).toHaveBeenCalled();
            expect(fileInput.addEventListener).toHaveBeenCalled();
            expect(fileInput.click).toHaveBeenCalled();


            fileInput.addEventListener.mock.calls[0][1]();

            expect(uploader.add).toHaveBeenCalledWith(files, options);
        });
    });
});


