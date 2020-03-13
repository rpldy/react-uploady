import assertContext from "../assertContext";
import useUploadOptions from "../useUploadOptions";

jest.mock("../assertContext", () => jest.fn());

describe("useUploadOptions tests", () => {

    const context = {
        setOptions: jest.fn(),
    };

    beforeAll(() => {
        assertContext.mockReturnValue(context);
    });

    it("should set options on context", () => {
        const options = { autoUpload: true };

        testCustomHook(useUploadOptions, () => [options]);

        expect(context.setOptions).toHaveBeenCalledWith(options);
    });
});
