// import { request } from "@rpldy/shared/src/tests/mocks/rpldy-shared.mock";
import  { resolveUploadUrl } from "../createUpload";

describe("createUpload tests", () => {

    describe("resolveUploadUrl tests", () => {

        it.each([
            "//", "http://", "https://"
        ])("should return full URL as is", (prefix) => {
            const loc = `${prefix}www.test.com/upload/123`;
            expect(resolveUploadUrl("", loc))
                .toEqual(loc);
        });

        it.each([
            "/upload/123",
            "upload/123"
        ])("should combine location with create url without trailing /", (loc) => {
            expect(resolveUploadUrl("https://www.test.com/tus", loc))
                .toEqual("https://www.test.com/tus/upload/123");
        });

        it.each([
            "/upload/123",
            "upload/123"
        ])("should combine location with create url with trailing /", (loc) => {
            expect(resolveUploadUrl("https://www.test.com/tus/", loc))
                .toEqual("https://www.test.com/tus/upload/123");
        });
    });

    describe("createUpload tests", () => {


    });
});
