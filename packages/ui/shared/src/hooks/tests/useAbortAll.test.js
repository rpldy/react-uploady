import useUploadyContext from "../useUploadyContext";
import useAbortAll from "../useAbortAll";

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
		const { result } = renderHook(useAbortAll);

		result.current();

		expect(context.abort).toHaveBeenCalled();
	});
});
