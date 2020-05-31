import { invariant } from "@rpldy/shared/src/tests/mocks/rpldy-shared.mock";
import { UploadyContext } from "@rpldy/shared-ui/src/tests/mocks/rpldy-ui-shared.mock";
import { clearResumables } from "@rpldy/tus-sender";
import { NO_EXT } from "../consts";
import useClearResumableStore from "../useClearResumableStore";

jest.mock("@rpldy/tus-sender", () =>({
	clearResumables: jest.fn(),
}));

describe("useClearResumableStore tests", () => {

	it("should throw if ext not registered ", () => {
		testCustomHook(useClearResumableStore);
		expect(invariant).toHaveBeenCalledWith(undefined, NO_EXT);
	});

	it("should return retry from context ", () => {
		const getOptions = jest.fn();

		UploadyContext.getExtension.mockReturnValueOnce({
			getOptions
		});

		const { hookResult } = testCustomHook(useClearResumableStore);

		hookResult();
		expect(getOptions).toHaveBeenCalled();
		expect(clearResumables).toHaveBeenCalled();
	});
});
