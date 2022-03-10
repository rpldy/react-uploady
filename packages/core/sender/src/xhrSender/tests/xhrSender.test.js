/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "doTest"] }] */
import {
    FILE_STATES,
    request,
    parseResponseHeaders
} from "@rpldy/shared/src/tests/mocks/rpldy-shared.mock";
import MissingUrlError from "../../MissingUrlError";
import getXhrSend, { SUCCESS_CODES } from "../xhrSender";
import prepareFormData from "../prepareFormData";

jest.mock("../prepareFormData", () => jest.fn());

describe("xhrSender tests", () => {
    beforeEach(() => {
        clearJestMocks(
            request,
            parseResponseHeaders,
            prepareFormData,
        );

        parseResponseHeaders.mockReset();
    });

    const doTest = (options = {}, responseHeaders, items, url = "test.com", send = getXhrSend()) => {
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

        if (options.sendWithFormData && !options.formatServerResponse) {
            prepareFormData.mockReturnValueOnce({ test: true });
        }

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

        if (url) {
            prepareFormData.mockReturnValueOnce({ test: true });

            responseHeaders = responseHeaders || { "content-type": "application/json" };
            parseResponseHeaders.mockReturnValueOnce(responseHeaders);

            if (options.sendWithFormData || items.length === 1) {
                request.mockReturnValueOnce(pXhr);
            }
        }

        const sendResult = send(items, url, options, mockProgress);

        const confirmRequest = () => {
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
        };

        return {
            sendResult,
            xhr,
            pXhr,
            xhrResolve,
            xhrReject,
            mockProgress,
            options,
            items,
            responseHeaders,
            confirmRequest,
            url,
        };
    };

    it("should throw MissingUrl if no url provided", () => {
        expect(() => {
            doTest({}, null, [], null);
        }).toThrow(MissingUrlError);
    });

    describe("success tests", () => {
        it.each(SUCCESS_CODES)
        ("should make request successfully for code: %s", async (code) => {
            const test = doTest();

            test.confirmRequest();

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

            test.confirmRequest();

            test.xhr.readyState = 1;
            test.sendResult.abort();

            const result = await test.sendResult.request;
            expect(result.state).toBe(FILE_STATES.ABORTED);
            expect(result.response).toBe("aborted");
        });

        it("should not abort already finished upload", () => {
            const test = doTest();

            test.confirmRequest();

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
        it("should throw error on multiple items", () => {
            expect(() => {
                doTest({ sendWithFormData: false });
            }).toThrow();
        });

        it("should send single item file", async () => {
            const test = doTest({ sendWithFormData: false }, null, [{ id: "u1", file: "file" }]);
            test.confirmRequest();

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
            test.confirmRequest();

            const responseData = { success: true };
            test.xhr.status = 200;
            test.xhr.response = JSON.stringify(responseData);

            test.xhrResolve();

            await test.sendResult.request;
        });
    });

    describe("with custom config", () => {

        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it("should work with config preRequestHandler", async() => {

            const customCode = jest.fn();

            const send = getXhrSend({
                preRequestHandler: (issueRequest, items, url) => {
                    return new Promise((resolve) => {
                        setTimeout(() => {
                            customCode(items, url);
                            resolve(issueRequest());
                        }, 1000);
                    }) ;
                },
            });

            const { sendResult, items, url, confirmRequest, xhrResolve, xhr } = doTest({}, null, [1, 2], "test.com", send);

            jest.runAllTimers();

            confirmRequest();
            xhr.status = 200;
            xhrResolve();

            const result = await sendResult.request;

            expect(result.state).toBe( FILE_STATES.FINISHED);

            expect(customCode).toHaveBeenCalledWith(items, url);
        });

        it("should work with abort from config preRequestHandler", async() => {
            const send = getXhrSend({
                preRequestHandler: (issueRequest) => {
                    return new Promise((resolve) => {
                        setTimeout(() => {
                            resolve(issueRequest());
                        }, 1000);
                    }) ;
                },
            });

            const { sendResult, confirmRequest, xhr } = doTest({}, null, [1, 2], "test.com", send);

            jest.runAllTimers();

            confirmRequest();

            xhr.readyState = 1;
            sendResult.abort();

            const result = await sendResult.request;
            expect(result.state).toBe(FILE_STATES.ABORTED);
            expect(result.response).toBe("aborted");
        });

        it("issueRequest should accept override params", () => {
            const requestUrl = "override.com",
                requestDate = "override data",
                requestOptions = {test: "override options"};

            const send = getXhrSend({
                preRequestHandler: (issueRequest) => {
                    return new Promise((resolve) => {
                        setTimeout(() => {
                            resolve(issueRequest(requestUrl, requestDate, requestOptions));
                        }, 1000);
                    }) ;
                },
            });

            doTest({ }, null, [1,2], "test.com", send);

            jest.runAllTimers();

            expect(request).toHaveBeenCalledWith(requestUrl, requestDate, expect.objectContaining(requestOptions));
        });

        it("should use config getRequestData", async () => {
            const sendItems = [1,2],
                sendOptions = { test: true },
                sendData = "data!";

            const send = getXhrSend({
                getRequestData: (items, options) => {
                    expect(items).toBe(sendItems);
                    expect(options.test).toBe(true);

                    return sendData;
                },
            });

            const { url } = doTest(sendOptions, null, sendItems, "test.com", send);

            expect(request).toHaveBeenCalledWith(url, sendData, expect.any(Object));
            expect(prepareFormData).not.toHaveBeenCalled();
        });
    });

    describe("formatServerResponse tests", () => {
        it("should use custom format function", async () => {
            const formatServerResponse = jest.fn(() => "parsed");
            const test = doTest({ formatServerResponse }, {});

            test.xhr.status = 200;
            test.xhr.response = "test";
            test.xhrResolve();

            const result = await test.sendResult.request;

            expect(result.response.data).toBe("parsed");
            expect(formatServerResponse).toHaveBeenCalledWith("test", 200, {});
        });
    });

    describe("with custom is success callback", () => {
        it("should use custom isSuccessfulCall callback to get success", async () => {
            const isSuccess = (xhr) => {
                expect(xhr.status).toBe(308);
                return true;
            };

            const test = doTest({ isSuccessfulCall: isSuccess });

            test.xhr.status = 308;
            test.xhrResolve();

            const result = await test.sendResult.request;

            expect(result.state).toBe(FILE_STATES.FINISHED);
        });

        it("should use custom isSuccessfulCall callback to get failed", async () => {
            const isSuccess = (xhr) => {
                expect(xhr.status).toBe(200);
                return false;
            };

            const test = doTest({ isSuccessfulCall: isSuccess });

            test.xhr.status = 200;
            test.xhrResolve();

            const result = await test.sendResult.request;

            expect(result.state).toBe(FILE_STATES.ERROR);
        });
    });
});
