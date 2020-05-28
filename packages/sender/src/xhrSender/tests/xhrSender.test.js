/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "doTest"] }] */
import {
    FILE_STATES,
    request,
    parseResponseHeaders
} from "@rpldy/shared/src/tests/mocks/rpldy-shared.mock";
import send, { SUCCESS_CODES } from "../xhrSender";
import prepareFormData from "../prepareFormData";

jest.mock("../prepareFormData", () => jest.fn());

describe("xhrSender tests", () => {

    beforeEach(() => {
        clearJestMocks(
            request,
            parseResponseHeaders
        );

        parseResponseHeaders.mockReset();
    });

    const doTest = (options = {}, responseHeaders, items) => {
        options = {
            method: "GET",
            headers: {
                foo: "bar",
            },
            withCredentials: true,
            sendWithFormData: true,
            ...options
        };

        const mockProgress = jest.fn();
        items = items || [{ id: "u1" }, { id: "u2" }];

        const url = "test.com";

        prepareFormData.mockReturnValueOnce({ test: true });

        responseHeaders = responseHeaders || { "content-type": "application/json" };
        parseResponseHeaders.mockReturnValueOnce(responseHeaders);

        let xhrResolve, xhrReject;

        const xhr = {
            upload: {},
            abort: jest.fn(() => xhrReject()),
        };

        const pXhr = new Promise((resolve, reject) => {
            xhrResolve = () => resolve(xhr);
            xhrReject = () => reject(xhr);
        });

        pXhr.xhr = xhr;

        request.mockReturnValueOnce(pXhr);

        const sendResult = send(items, url, options, mockProgress);

        expect(request).toHaveBeenCalledWith(url,
            options.sendWithFormData ? { test: true } : (items[0].file || items[0].url),
            {
                method: options.method,
                headers: options.headers,
                withCredentials: options.withCredentials,
                preSend: expect.any(Function),
            });

        if (options.sendWithFormData) {
            expect(prepareFormData).toHaveBeenCalledWith(items, options);
        }

        return {
            sendResult,
            xhr,
            pXhr,
            xhrResolve,
            xhrReject,
            mockProgress,
            options,
            items,
            responseHeaders
        };
    };

    describe("success tests", () => {
        it.each(SUCCESS_CODES)
        ("should make request successfully for code: %s", async (code) => {
            const test = doTest();

            const responseData = { success: true };
            test.xhr.status = code;
            test.xhr.response = JSON.stringify(responseData);

            test.xhrResolve();

            const result = await test.sendResult.request;

            expect(result).toEqual({
                state: FILE_STATES.FINISHED,
                response: { data: { "success": true }, headers: test.responseHeaders },
                status: code,
            });

            request.mock.calls[0][2].preSend(test.xhr);

            const progressEvent = { lengthComputable: true, loaded: 100 };
            test.xhr.upload.onprogress(progressEvent);
            expect(test.mockProgress).toHaveBeenCalledWith(progressEvent, test.items);

            test.xhr.upload.onprogress({});
            expect(test.mockProgress).toHaveBeenCalledTimes(1);
        });
    });

    describe("abort tests", () => {
        it("should abort running upload", async () => {
            const test = doTest();

            test.xhr.readyState = 1;
            test.sendResult.abort();

            const result = await test.sendResult.request;
            expect(result.state).toBe(FILE_STATES.ABORTED);
            expect(result.response).toBe("aborted");
        });

        it("should not abort already finished upload", () => {
            const test = doTest();

            test.xhr.readyState = 4;
            test.sendResult.abort();

            expect(test.xhr.abort).not.toHaveBeenCalled();
        });
    });

    describe("json parse tests", () => {

        it("should try parse json with forceJsonResponse", async () => {

            const responseData = { success: true };

            const test = doTest({ forceJsonResponse: true }, {});

            test.xhr.status = 200;
            test.xhr.response = JSON.stringify(responseData);
            test.xhrResolve();

            const result = await test.sendResult.request;

            expect(result.state).toEqual(FILE_STATES.FINISHED);
            expect(result.response.data).toEqual(responseData);
        });

        it("should not parse if no header and no force", async () => {

            const responseData = { success: true };

            const test = doTest({}, {});

            test.xhr.status = 200;
            test.xhr.response = JSON.stringify(responseData);
            test.xhrResolve();

            const result = await test.sendResult.request;

            expect(result.state).toEqual(FILE_STATES.FINISHED);
            expect(result.response.data).toEqual(JSON.stringify(responseData));
        });
    });

    describe("request error & failure tests", () => {

        it("should handle request failure", async () => {
            const responseData = { failure: true };

            const test = doTest();

            test.xhr.status = 400;
            test.xhr.response = JSON.stringify(responseData);

            test.xhrResolve();

            const result = await test.sendResult.request;

            expect(result.state).toEqual(FILE_STATES.ERROR);
            expect(result.response.data).toEqual(responseData);
        });

        it("should handle error", async () => {
            const test = doTest();

            test.xhrReject();

            const result = await test.sendResult.request;
            expect(result.state).toEqual(FILE_STATES.ERROR);
        });
    });

    describe("without formdata tests", () => {

        it("should send single item file", async () => {
            const test = doTest({ sendWithFormData: false }, null, [{ id: "u1", file: "file" }]);

            const responseData = { success: true };
            test.xhr.status = 200;
            test.xhr.response = JSON.stringify(responseData);

            test.xhrResolve();

            const result = await test.sendResult.request;

            expect(result).toEqual({
                state: FILE_STATES.FINISHED,
                response: { data: { "success": true }, headers: test.responseHeaders },
                status: 200,
            });
        });

        it("should send single item url", async () => {
            const test = doTest({ sendWithFormData: false }, null, [{ id: "u1", url: "url" }]);

            const responseData = { success: true };
            test.xhr.status = 200;
            test.xhr.response = JSON.stringify(responseData);

            test.xhrResolve();

            await test.sendResult.request;
        });

        it("should throw error on multiple items", () => {
            expect(() => {
                doTest({ sendWithFormData: false });
            }).toThrow();
        });
    });
});
