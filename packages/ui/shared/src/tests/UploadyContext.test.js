import warning from "warning";
import {uploader} from "@rpldy/uploader/src/tests/mocks/rpldy-uploader.mock";
import { createContextApi } from "../UploadyContext";

jest.mock("warning", () => jest.fn());

describe("UploadyContext tests", () => {

    const fileInput = {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        click: jest.fn(),
    };

    const getTestContext = (input, contextUploader = uploader) => {
        const inputRef = input === null ?
            { current: null } :
            { current: { ...fileInput, ...input } };

        return createContextApi(contextUploader, inputRef);
    };

    beforeEach(() => {
        clearJestMocks(
            fileInput.addEventListener,
            fileInput.removeEventListener,
            uploader,
        );
    });

    it("should call upload on uploader", () => {
        const contextApi = getTestContext();

        const files = [1, 2],
            options = { multiple: true };

        contextApi.upload(files, options);

        expect(uploader.add).toHaveBeenCalledWith(files, options);
    });

    it("should call abort on uploader", () => {
        getTestContext().abort("123");
        expect(uploader.abort).toHaveBeenCalledWith("123");
    });

    it("should call abortBatch on uploader", () => {
        getTestContext().abortBatch("abc");
        expect(uploader.abortBatch).toHaveBeenCalledWith("abc");
    });

    it("should call on on uploader", () => {
        uploader.on.mockReturnValueOnce(true);
        const result = getTestContext().on("abc", [1,2]);
        expect(result).toBe(true);
        expect(uploader.on).toHaveBeenCalledWith("abc", [1,2]);
    });

    it("should call once on uploader", () => {
        uploader.once.mockReturnValueOnce(true);
        const result = getTestContext().once("abc", [1,2]);
        expect(result).toBe(true);
        expect(uploader.once).toHaveBeenCalledWith("abc", [1,2]);
    });

    it("should call off on uploader", () => {
        uploader.off.mockReturnValueOnce(true);
        const result = getTestContext().off("abc", [1,2]);
        expect(result).toBe(true);
        expect(uploader.off).toHaveBeenCalledWith("abc", [1,2]);
    });

    describe("hasUploader tests", () => {
        it("should return true when uploader provided", () => {
            expect(getTestContext().hasUploader()).toBe(true);
        });

        it("should return false when uploader not provided", () => {
            expect(getTestContext(null, null).hasUploader()).toBe(false);
        });
    });

    describe("input file upload tests", () => {
        it("should throw if no file input", () => {
            const contextApi = getTestContext(null);

            expect(()=>{
                contextApi.showFileUpload();
            }).toThrow("Uploady - ");
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


