import assertContext from "../assertContext";
import useAbortItem from "../useAbortItem";

jest.mock("../assertContext", () => jest.fn());

describe("useAbortItem tests", () => {

	const context = {
		abort: jest.fn()
	};

	beforeAll(() => {
		assertContext.mockReturnValue(context);
	});

	beforeEach(() => {
		clearJestMocks(context);
	});

	it("should return abort item", () => {

		const { hookResult } = testCustomHook(useAbortItem);

		hookResult("123");

		expect(context.abort).toHaveBeenCalledWith("123");
	});
});
