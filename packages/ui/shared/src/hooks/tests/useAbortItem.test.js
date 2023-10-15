import useUploadyContext from "../useUploadyContext";
import useAbortItem from "../useAbortItem";

vi.mock("../useUploadyContext");

describe("useAbortItem tests", () => {
	const context = {
		abort: vi.fn()
	};

	beforeAll(() => {
        useUploadyContext.mockReturnValue(context);
	});

	beforeEach(() => {
		clearViMocks(context);
	});

	it("should return abort item", () => {
		const { result } = renderHook(useAbortItem);

		result.current("123");

		expect(context.abort).toHaveBeenCalledWith("123");
	});
});
