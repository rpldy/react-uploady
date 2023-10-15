import { invariant } from "@rpldy/shared/src/tests/mocks/rpldy-shared.mock";
import { UploadyContext } from "@rpldy/shared-ui/src/tests/mocks/rpldy-ui-shared.mock";
import { NO_EXT } from "../consts";
import useRetry from "../useRetry";

describe("useRetry tests", () => {
    beforeEach(() => {
        invariant.mockReset();
    });

    it("should throw if ext not registered", () => {
        invariant.mockImplementation(() => {
            throw new Error("bah");
        });

        expect(() => {
            renderHookWithError(useRetry);
        }).toThrow("bah");

        expect(invariant).toHaveBeenCalledWith(undefined, NO_EXT);
    });

    it("should return retry from context", () => {
        UploadyContext.getExtension.mockReturnValueOnce({
            retry: "test"
        });

        const { result } = renderHook(useRetry);

        expect(result.current).toBe("test");
    });
});
