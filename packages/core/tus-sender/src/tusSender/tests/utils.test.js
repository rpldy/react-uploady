import {
    addLocationToResponse,
    getUploadMetadata,
    createResumeSuccessResult,
    getHeadersWithoutContentRange,
} from "../utils";

describe("utils tests", () => {
    describe("getUploadMetadata tests", () => {
        it("should return undefined if no params", () => {
            expect(getUploadMetadata({})).toBeUndefined();
        });

        it("should return undefined if empty params", () => {
            expect(getUploadMetadata({ params: {} })).toBeUndefined();
        });

        it("should return encoded string for params", () => {
            const options = { params: { test: "a", foo: "bar", "empty": "" } };
            expect(getUploadMetadata(options)).toBe("test YQ==,foo YmFy,empty ");
        });
    });

    describe("addLocationToResponse tests", () => {
        it("should add location to successful response", async () => {
            const result = addLocationToResponse(Promise.resolve({
                status: 200,
                state: "finished",
                response: { message: "TUS server has file" },
            }), "http://test.com");

            expect(await result).toEqual({
                status: 200,
                state: "finished",
                response: { message: "TUS server has file", location: "http://test.com" },
            });
        });

        it("should not add location to non successful response", async () => {
            const result = addLocationToResponse(Promise.resolve({
                status: 500,
                state: "failed",
                response: { message: "TUS server has no file" },
            }), "http://test.com");

            expect(await result).toEqual({
                status: 500,
                state: "failed",
                response: { message: "TUS server has no file" },
            });
        });
    });

    describe("createResumeSuccessResult tests", () => {
        it("should create successful resume result with location", async () => {
            const result = createResumeSuccessResult("http://test.com");

            expect(await result).toEqual({
                status: 200,
                state: "finished",
                response: { message: "TUS server has file", location: "http://test.com" },
            });
        });
    });

    describe("getHeadersWithoutContentRange tests", () => {
        it("should remove content-range header", () => {
            const headers = {
                "Content-Range": "bytes 0-1/2",
                "Content-Type": "text/plain",
            };

            expect(getHeadersWithoutContentRange(headers)).toEqual({
                "Content-Range": undefined,
                "Content-Type": "text/plain",
            });
        });
    });
});
