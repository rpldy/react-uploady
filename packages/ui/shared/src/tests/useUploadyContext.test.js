import assertContext from "../assertContext";
import useUploadyContext from "../useUploadyContext";

jest.mock("../assertContext");

describe("useUploadyContext tests", () => {

    beforeAll(()=>{
        assertContext.mockReturnValue("context");
    });

    it("should set options on context", () => {
        const { getHookResult } = testCustomHook(useUploadyContext);

        expect(getHookResult()).toBe("context");
    });
});


