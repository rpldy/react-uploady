import parseResponseHeaders from "../parseResponseHeaders";

describe("parseResponseHeaders tests", () => {
    const getAllResponseHeaders = vi.fn(() =>  `content-type: application/json
x-header: test`);

    it("should parse headers", () => {
        const headers = parseResponseHeaders({
            getAllResponseHeaders
        });

        expect(headers).toEqual({
            "content-type": "application/json",
            "x-header": "test",
        });
    });

    it("should fail silently", () => {
        getAllResponseHeaders.mockImplementationOnce(() => {
            throw new Error("bla");
        });

        const headers = parseResponseHeaders({
            getAllResponseHeaders
        });

        expect(headers).toBeUndefined();
    });
});
