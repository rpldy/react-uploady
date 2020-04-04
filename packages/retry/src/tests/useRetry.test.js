import invariant from "invariant";
import { UploadyContext } from "@rpldy/shared-ui/src/tests/mocks/rpldy-ui-shared.mock";
import { NO_EXT } from "../consts";
import useRetry from "../useRetry";

jest.mock("invariant", () => jest.fn());

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
