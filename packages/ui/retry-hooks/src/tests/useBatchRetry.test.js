import { invariant } from "@rpldy/shared/src/tests/mocks/rpldy-shared.mock";
import { UploadyContext } from "@rpldy/shared-ui/src/tests/mocks/rpldy-ui-shared.mock";
import { NO_EXT } from "../consts";
import useBatchRetry from "../useBatchRetry";

describe("useBatchRetry tests",  () => {
    beforeEach(() => {
        invariant.mockReset();
    });

    it("should throw if ext not registered", async() => {
        invariant.mockImplementation(() => {
            throw new Error("bah");
        });

        expect(() => {
            renderHookWithError(useBatchRetry);
        }).toThrow("bah");

        expect(invariant).toHaveBeenCalledWith(undefined, NO_EXT);
    });

    it("should return batchRetry from context", () => {
        UploadyContext.getExtension.mockReturnValueOnce({
            retryBatch: "test"
        });

        const { result } = renderHook(useBatchRetry);

        expect(result.current).toBe("test");
    });
});
