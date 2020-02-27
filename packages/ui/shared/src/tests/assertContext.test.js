import assertContext, { ERROR_MSG } from "../assertContext";
import warning from "warning";

jest.mock("warning", () => jest.fn());

describe("assertContext tests", () => {

    it("should throw if no context", () => {
        assertContext();
        expect(warning).toHaveBeenCalledWith(
            undefined,
            expect.any(String)
        );
    });

    it("should throw if no uploader", () => {
        assertContext({ hasUploader: () => false });

        expect(warning).toHaveBeenCalledWith(
            undefined,
            expect.any(String)
        );
    });

    it("should not throw when has context and uploader", () => {
        const context = { hasUploader: () => true };

        const result = assertContext(context);

        expect(result).toBe(context);

        expect(warning).toHaveBeenCalledWith(
            true,
            expect.any(String)
        );
    });
});
