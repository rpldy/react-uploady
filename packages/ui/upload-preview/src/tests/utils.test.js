import { PREVIEW_TYPES } from "../consts";
import { PREVIEW_DEFAULTS } from "../defaults";
import { getFallbackUrl, getWithMandatoryOptions, getFileObjectUrlByType } from "../utils";

describe("utils tests", () => {

    describe("getWithMandatoryOptions tests", () => {

        it("should return with defaults and overrides", () => {
            const props = {
                loadFirstOnly: true,
                fallbackUrl: "test.com",
                previewComponentProps: { foo: "bar" }
            };

            const withOptions = getWithMandatoryOptions(props);

            expect(withOptions).toEqual({
                ...PREVIEW_DEFAULTS,
                loadFirstOnly: true,
                fallbackUrl: "test.com",
                previewComponentProps: { foo: "bar" }
            });
        });
    });

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

    describe("getFileObjectUrlByType tests", () => {
        const url = "blob:test";

        beforeAll(() => {
            URL.createObjectURL = jest.fn(() => url);
        });

        afterAll(() => {
            URL.createObjectURL = undefined;
        });

        it("should return preview for mimetype when under max", () => {
            const file = { type: "image/jpg", size: 100 };
            const result = getFileObjectUrlByType("type", ["image/jpg"], 1000, file);

            expect(result).toEqual({
                url,
                type: "type"
            });
        });

        it("should return undefined if no mime type match", () => {
            const file = { type: "image/jpg", size: 100 };
            const result = getFileObjectUrlByType("type", ["image/png"], 1000, file);

            expect(result).toBeUndefined();
        });

        it("should return undefined if file over max size", () => {
            const file = { type: "image/jpg", size: 100 };
            const result = getFileObjectUrlByType("type", ["image/jpg"], 99, file);

            expect(result).toBeUndefined();
        });
    });
});
