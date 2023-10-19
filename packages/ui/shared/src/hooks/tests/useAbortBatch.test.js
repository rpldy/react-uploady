import useUploadyContext from "../useUploadyContext";
import useAbortBatch from "../useAbortBatch";

vi.mock("../useUploadyContext");

describe("useAbortItem tests", () => {
	const context = {
		abortBatch: vi.fn()
	};

	beforeAll(() => {
        useUploadyContext.mockReturnValue(context);
	});

	beforeEach(() => {
		clearViMocks(context);
	});

	it("should return abort item", () => {
		const { result } = renderHook(useAbortBatch);

		result.current("123");

		expect(context.abortBatch).toHaveBeenCalledWith("123");
	});
});
