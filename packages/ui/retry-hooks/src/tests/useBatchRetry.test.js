import { invariant } from "@rpldy/shared/src/tests/mocks/rpldy-shared.mock";
import { UploadyContext } from "@rpldy/shared-ui/src/tests/mocks/rpldy-ui-shared.mock";
import { NO_EXT } from "../consts";
import useBatchRetry from "../useBatchRetry";

jest.mock("invariant", () => jest.fn());

describe("useBatchRetry tests", () => {
    it("should throw if ext not registered", () => {
        const { getError } = testCustomHook(useBatchRetry);

        expect(invariant).toHaveBeenCalledWith(undefined, NO_EXT);

        expect(getError().message).toBe("Cannot read properties of undefined (reading 'retryBatch')");
    });

    it("should return batchRetry from context", () => {
        UploadyContext.getExtension.mockReturnValueOnce({
            retryBatch: "test"
        });

        const { getHookResult } = testCustomHook(useBatchRetry);

        expect(getHookResult()).toBe("test");
    });
});
