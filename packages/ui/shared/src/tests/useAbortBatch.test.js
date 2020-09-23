import useUploadyContext from "../useUploadyContext";
import useAbortBatch from "../useAbortBatch";

jest.mock("../useUploadyContext");

describe("useAbortItem tests", () => {

	const context = {
		abortBatch: jest.fn()
	};

	beforeAll(() => {
        useUploadyContext.mockReturnValue(context);
	});

	beforeEach(() => {
		clearJestMocks(context);
	});

	it("should return abort item", () => {

		const { getHookResult } = testCustomHook(useAbortBatch);

		getHookResult()("123");

		expect(context.abortBatch).toHaveBeenCalledWith("123");
	});
});
