import useUploadyContext from "../useUploadyContext";
import useAbortItem from "../useAbortItem";

jest.mock("../useUploadyContext");

describe("useAbortItem tests", () => {

	const context = {
		abort: jest.fn()
	};

	beforeAll(() => {
        useUploadyContext.mockReturnValue(context);
	});

	beforeEach(() => {
		clearJestMocks(context);
	});

	it("should return abort item", () => {

		const { getHookResult } = testCustomHook(useAbortItem);

		getHookResult()("123");

		expect(context.abort).toHaveBeenCalledWith("123");
	});
});
