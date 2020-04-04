import invariant from "invariant";
import { UploadyContext } from "@rpldy/shared-ui/src/tests/mocks/rpldy-ui-shared.mock";
import { NO_EXT } from "../consts";
import useBatchRetry from "../useBatchRetry";

jest.mock("invariant", () => jest.fn());

describe("useBatchRetry tests", () => {

    it("should throw if ext not registered ", () => {
        const { error } = testCustomHook(useBatchRetry);

        expect(invariant).toHaveBeenCalledWith(undefined, NO_EXT);

        expect(error.message).toBe("Cannot read property 'retryBatch' of undefined");
    });

    it("should return batchRetry from context ", () => {
        UploadyContext.getExtension.mockReturnValueOnce({
            retryBatch: "test"
        });

        const { hookResult } = testCustomHook(useBatchRetry);

        expect(hookResult).toBe("test");
    });
});
