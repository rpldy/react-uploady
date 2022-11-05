import { invariant } from "@rpldy/shared/src/tests/mocks/rpldy-shared.mock";
import { UploadyContext } from "@rpldy/shared-ui/src/tests/mocks/rpldy-ui-shared.mock";
import { NO_EXT } from "../consts";
import useRetry from "../useRetry";

describe("useRetry tests", () => {
    it("should throw if ext not registered", () => {
        const { getError } = testCustomHook(useRetry);

        expect(invariant).toHaveBeenCalledWith(undefined, NO_EXT);

        const msg = getError().message;

        expect(msg).toContain("Cannot read proper");
        expect(msg).toContain("of undefined");
        expect(msg).toContain("'retry'");
    });

    it("should return retry from context", () => {
        UploadyContext.getExtension.mockReturnValueOnce({
            retry: "test"
        });

        const { getHookResult } = testCustomHook(useRetry);

        expect(getHookResult()).toBe("test");
    });
});
