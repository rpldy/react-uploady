import { getFallbackUrl } from "../utils";
import { PREVIEW_TYPES } from "../consts";

describe("utils tests", () => {


    describe("getFallbackUrl tests", () => {

        it("should use fallbackProp as function returning object", () => {

            const result = getFallbackUrl(() => ({ test: true }), {});

            expect(result).toEqual({ test: true });
        });

        it("should use fallbackProp as function returning string", () => {

            const result = getFallbackUrl(() => "test.com", {});

            expect(result).toEqual({
                url: "test.com",
                type: PREVIEW_TYPES.IMAGE
            });
        });

        it("should use fallbackProp as string", () => {

            const result = getFallbackUrl("test.com", {});
            expect(result).toEqual({
                url: "test.com",
                type: PREVIEW_TYPES.IMAGE
            });
        });

        it("should use fallbackProp as object", () => {
            const result = getFallbackUrl({ test: true }, {});
            expect(result).toEqual({ test: true });
        });
    });


});
