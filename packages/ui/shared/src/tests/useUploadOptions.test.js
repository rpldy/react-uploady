import assertContext from "../assertContext";
import useUploadOptions from "../useUploadOptions";

jest.mock("../assertContext", () => jest.fn());

describe("useUploadOptions tests", () => {

    const context = {
        setOptions: jest.fn(),
        getOptions: jest.fn(),
    };

    beforeAll(() => {
        assertContext.mockReturnValue(context);
    });

    beforeEach(() => {
        clearJestMocks(context);
    });

    it("should set options on context", () => {
        const options = { autoUpload: true };
        context.getOptions.mockReturnValueOnce(options);

        const { hookResult } = testCustomHook(useUploadOptions, () => [options]);

        expect(context.setOptions).toHaveBeenCalledWith(options);
        expect(hookResult).toBe(options);
    });

    it("should not set options when not passed", () => {
        const options = { autoUpload: true };
        context.getOptions.mockReturnValueOnce(options);

        const { hookResult } = testCustomHook(useUploadOptions, () => []);

        expect(context.setOptions).not.toHaveBeenCalled();
        expect(hookResult).toBe(options);
    });
});
