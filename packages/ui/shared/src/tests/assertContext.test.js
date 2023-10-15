import assertContext, { ERROR_MSG, DIFFERENT_VERSION_ERROR_MSG } from "../assertContext";
import { getIsVersionRegisteredAndDifferent, getRegisteredVersion } from "../uploadyVersion";

vi.mock("../uploadyVersion");

describe("assertContext tests", () => {
    it("should throw if no context", () => {
        expect(assertContext).toThrow(ERROR_MSG);
    });

    it("should throw if no uploader", () => {
        expect(() => {
            assertContext({ hasUploader: () => false });
        }).toThrow(ERROR_MSG);
    });

    it("should throw if different version", () => {
        getIsVersionRegisteredAndDifferent.mockReturnValueOnce(true);
        getRegisteredVersion.mockReturnValueOnce("1");

        expect(() => {
            assertContext(null);
        }).toThrow(DIFFERENT_VERSION_ERROR_MSG.replace("%s", "1"));
    });

    it("should not throw when has context and uploader", () => {
        getIsVersionRegisteredAndDifferent.mockReturnValueOnce(false);

        const context = { hasUploader: () => true };

        const result = assertContext(context);

        expect(result).toBe(context);
    });
});
