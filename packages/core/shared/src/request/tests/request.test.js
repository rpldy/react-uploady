import request from "../index";

describe("request tests", () => {
    const mockXhr = (fn) => {
        window.XMLHttpRequest = function () {
            const xhr = {
                upload: {},
                setRequestHeader: jest.fn(),
                open: jest.fn(),
                send: jest.fn(),
                getAllResponseHeaders: jest.fn(),
                abort: jest.fn(() => {
                    xhr.onabort();
                }),
            };

            fn(xhr);

            return xhr;
        };
    };

    const doTest = (tester, options = {}) => {
        let testXhr;

        mockXhr((xhr) => {
            testXhr = xhr;
        });

        options = {
            method: "GET",
            headers: {
                foo: "bar",
                empty: undefined,
            },
            withCredentials: false,
            ...options
        };

        const data = { test: true };

        const url = "test.com";

        const sendResult = request(url, data, options);

        if (options.headers) {
            expect(testXhr.setRequestHeader).toHaveBeenCalledWith("foo", "bar");
            expect(testXhr.setRequestHeader).not.toHaveBeenCalledWith("empty", undefined);
        }

        const assertRequest = () => {
            expect(testXhr.open).toHaveBeenCalledWith(options.method, url);
            expect(testXhr.withCredentials).toBe(!!options.withCredentials);
        };

        sendResult.then((data) => {
            assertRequest();
            tester(data);
        }).catch((data) => {
            assertRequest();
            tester(data, true);
        });

        return {
            sendResult,
            testXhr,
            options,
            data,
        };
    };

    it("should make simple request", async () => {
        let testXhr;

        mockXhr((xhr) => {
            testXhr = xhr;
        });

        const sendResult = request("test.com");

        testXhr.onload();

        const result = await sendResult;

        expect(result).toBe(testXhr);
    });

    it("should make successful request", () => {
        const responseData = { success: true };

        const test = doTest((data) => {
            expect(data.response).toEqual(JSON.stringify(responseData));
        });

        test.testXhr.status = 200;
        test.testXhr.response = JSON.stringify(responseData);
        test.testXhr.onload();
    });

    it("should use preSend option", () => {
        const preSend = jest.fn();
        const responseData = { success: true };

        const test = doTest((data) => {
            expect(data.response).toEqual(JSON.stringify(responseData));
        }, { preSend });

        expect(preSend).toHaveBeenCalledWith(test.testXhr);

        test.testXhr.status = 200;
        test.testXhr.response = JSON.stringify(responseData);
        test.testXhr.onload();
    });

    it("should reject on error", () => {

        const test = doTest((data, error) => {
            expect(error).toBe(true);
            expect(data.status).toBe(404);
        }, { method: "POST", withCredentials: true });

        test.testXhr.status = 404;
        test.testXhr.onerror();
    });

    it("should reject on abort", () => {

        const test = doTest((data, error) => {
            expect(error).toBe(true);
        }, { method: "POST", withCredentials: true });

        test.testXhr.abort();
    });

    it("should reject on timeout", () => {

        const test = doTest((data, error) => {
            expect(error).toBe(true);
        }, { method: "POST", withCredentials: true });

        test.testXhr.ontimeout();
    });
});
