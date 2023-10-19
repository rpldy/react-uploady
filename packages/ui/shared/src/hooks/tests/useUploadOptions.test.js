import useUploadyContext from "../useUploadyContext";
import useUploadOptions from "../useUploadOptions";

vi.mock("../useUploadyContext");

describe("useUploadOptions tests", () => {
    const context = {
        setOptions: vi.fn(),
        getOptions: vi.fn(),
    };

    beforeAll(() => {
        useUploadyContext.mockReturnValue(context);
    });

    beforeEach(() => {
        clearViMocks(context);
    });

    it("should set options on context", () => {
        const options = { autoUpload: true };
        context.getOptions.mockReturnValueOnce(options);

        const { result } = renderHook(() => useUploadOptions(options));

        expect(context.setOptions).toHaveBeenCalledWith(options);
        expect(result.current).toBe(options);
    });

    it("should not set options when not passed", () => {
        const options = { autoUpload: true };
        context.getOptions.mockReturnValueOnce(options);

        const { result } = renderHook(() => useUploadOptions());

        expect(context.setOptions).not.toHaveBeenCalled();
        expect(result.current).toBe(options);
    });
});
