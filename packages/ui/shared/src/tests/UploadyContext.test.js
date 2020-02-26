import { createContextApi } from "../UploadyContext";

describe("UploadyContext tests", () => {

    const uploader = {
        add: jest.fn(),
    };

    const fileInput = {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        click: jest.fn(),
    };

    const getTestContext = (input = fileInput) => {
        const inputRef = { current: input };
        return createContextApi(uploader, inputRef);
    };

    beforeEach(() => {
        clearJestMocks(
            fileInput.addEventListener,
            fileInput.removeEventListener
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

            expect(() => {
                contextApi.showFileUpload();
            }).toThrow();
        });

        it("should handle file input change with upload options", () => {

            const contextApi = getTestContext();
            const options = { autoUpload: true };
            contextApi.showFileUpload(options);

            expect(fileInput.removeEventListener).toHaveBeenCalled();
            expect(fileInput.addEventListener).toHaveBeenCalled();
            expect(fileInput.click).toHaveBeenCalled();

            const files = [1, 2];

            fileInput.addEventListener.mock.calls[0][1]({
                target: { files }
            });

            expect(uploader.add).toHaveBeenCalledWith(files, options);
        });
    });



});


