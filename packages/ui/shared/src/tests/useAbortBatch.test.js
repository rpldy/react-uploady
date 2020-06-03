import assertContext from "../assertContext";
import useAbortBatch from "../useAbortBatch";

jest.mock("../assertContext", () => jest.fn());

describe("useAbortItem tests", () => {

	const context = {
		abortBatch: jest.fn()
	};

	beforeAll(() => {
		assertContext.mockReturnValue(context);
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
