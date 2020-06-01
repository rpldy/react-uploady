import assertContext from "../assertContext";
import useAbortAll from "../useAbortAll";

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

		const { hookResult } = testCustomHook(useAbortAll);

		hookResult();

		expect(context.abort).toHaveBeenCalled();
	});
});
