import { invariant } from "@rpldy/shared/src/tests/mocks/rpldy-shared.mock";
import { UploadyContext } from "@rpldy/shared-ui/src/tests/mocks/rpldy-ui-shared.mock";
import { NO_EXT } from "../consts";
import useRetry from "../useRetry";

describe("useRetry tests", () => {

    it("should throw if ext not registered ", () => {
        const { error } = testCustomHook(useRetry);

        expect(invariant).toHaveBeenCalledWith(undefined, NO_EXT);

        expect(error.message).toBe("Cannot read property 'retry' of undefined");
    });

    it("should return retry from context ", () => {
        UploadyContext.getExtension.mockReturnValueOnce({
            retry: "test"
        });

        const { hookResult } = testCustomHook(useRetry);

        expect(hookResult).toBe("test");
    });
});
