import { invariant } from "@rpldy/shared/src/tests/mocks/rpldy-shared.mock";
import { UploadyContext } from "@rpldy/shared-ui/src/tests/mocks/rpldy-ui-shared.mock";
import { clearResumables } from "@rpldy/tus-sender";
import { NO_EXT } from "../consts";
import useClearResumableStore from "../useClearResumableStore";

vi.mock("@rpldy/tus-sender");

describe("useClearResumableStore tests", () => {
    beforeEach(() => {
        invariant.mockReset();
    });

	it("should throw if ext not registered", () => {
        invariant.mockImplementation(() => {
            throw new Error("bah");
        });

		expect(() => {
            renderHookWithError(useClearResumableStore);
        }).toThrow("bah");

		expect(invariant).toHaveBeenCalledWith(undefined, NO_EXT);
	});

	it("should return retry from context", () => {
		const getOptions = vi.fn();

		UploadyContext.getExtension.mockReturnValueOnce({
			getOptions
		});

		const { result } = renderHook(useClearResumableStore);

		result.current();
		expect(getOptions).toHaveBeenCalled();
		expect(clearResumables).toHaveBeenCalled();
	});
});
