import assertContext from "../../assertContext";
import useUploadyContext from "../useUploadyContext";

vi.mock("../../assertContext");

describe("useUploadyContext tests", () => {
    beforeAll(()=>{
        assertContext.mockReturnValue("context");
    });

    it("should set options on context", () => {
        const { result } = renderHook(useUploadyContext);

        expect(result.current).toBe("context");
    });
});


