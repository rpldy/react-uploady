import useUploadyContext from "../useUploadyContext";
import useAbortAll from "../useAbortAll";

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

		const { getHookResult } = testCustomHook(useAbortAll);

		getHookResult()();

		expect(context.abort).toHaveBeenCalled();
	});
});
