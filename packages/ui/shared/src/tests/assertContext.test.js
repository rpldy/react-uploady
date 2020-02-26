import assertContext, { ERROR_MSG } from "../assertContext";

describe("assertContext tests", () => {

    it("should throw if no context", () => {
        expect(assertContext).toThrow(ERROR_MSG);
    });

    it("should throw if no uploader", () => {
        expect(() => {
            assertContext({ hasUploader: () => false });
        }).toThrow(ERROR_MSG);
    });

    it("should not throw when has context and uploader", () => {
        const context = { hasUploader: () => true };

        const result = assertContext(context);

        expect(result).toBe(context);
    });
});
