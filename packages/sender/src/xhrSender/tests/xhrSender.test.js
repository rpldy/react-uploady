import { FILE_STATES } from "@rpldy/shared";

jest.mock("../prepareFormData", () => jest.fn());
import send, { SUCCESS_CODES } from "../xhrSender";
import mockPrepareFormData from "../prepareFormData";

describe("xhrSender tests", () => {

	const mockXhr = (fn) => {
		window.XMLHttpRequest = function () {
			const xhr = {
				upload: {},
				setRequestHeader: jest.fn(),
				open: jest.fn(),
				send: jest.fn(),
				getAllResponseHeaders: jest.fn(),
			};

			fn(xhr);

			return xhr;
		};
	};

	const doTest = (tester, ex = false, options = {}) => {
		let testXhr;

		mockXhr((xhr) => {
			testXhr = xhr;
		});

		options = {
			method: "GET",
			headers: {
				foo: "bar",
			},
			withCredentials: true,
			...options
		};

		const mockProgress = jest.fn();
		const items = [{ id: "u1" }, { id: "u2" }];

		const url = "test.com";

		const sendResult = send(items, url, options, mockProgress);

		testXhr.getAllResponseHeaders.mockReturnValueOnce(
			`content-type: application/json
x-header: test`);

		expect(mockPrepareFormData).toHaveBeenCalledWith(items, options);
		
		if (options.headers) {
			expect(testXhr.setRequestHeader).toHaveBeenCalledWith("foo", "bar");
		}

		sendResult.request.then((data) => {
			expect(testXhr.open).toHaveBeenCalledWith(options.method, url);
			expect(testXhr.withCredentials).toBe(!!options.withCredentials);

			if (!ex) {
				expect(data.response.headers).toEqual({
					"content-type": "application/json",
					"x-header": "test",
				});
			}

			tester(data);
		});

		return {
			sendResult,
			testXhr,
			mockProgress,
			options,
		};
	};

	describe("success tests", () => {
		it.each(SUCCESS_CODES)
		("should make request successfully for code: %s", (code, done) => {

			const responseData = { success: true };

			const test = doTest((data) => {
				expect(data.state).toEqual(FILE_STATES.FINISHED);
				expect(data.response.data).toEqual(responseData);

				done();
			});

			test.testXhr.status = code;
			test.testXhr.response = JSON.stringify(responseData);

			test.testXhr.onload();

			const progressEvent = { lengthComputable: true, loaded: 100 };
			test.testXhr.upload.onprogress(progressEvent);
			expect(test.mockProgress).toHaveBeenCalledWith(progressEvent);

			test.testXhr.upload.onprogress({});
			expect(test.mockProgress).toHaveBeenCalledTimes(1);
		});
	});

	it("should try parse json with forceJsonResponse", (done) => {

		const responseData = { success: true };

		const test = doTest((data) => {
			expect(data.state).toEqual(FILE_STATES.FINISHED);
			expect(data.response.data).toEqual(responseData);

			done();
		}, false, {
			headers: null,
			forceJsonResponse: true,
		});

		test.testXhr.status = 200;
		test.testXhr.response = JSON.stringify(responseData);

		test.testXhr.onload();
	});

	it("should handle request failure", (done) => {

		const responseData = { failure: true };

		const test = doTest((data) => {
			expect(data.state).toEqual(FILE_STATES.ERROR);
			expect(data.response.data).toEqual(responseData);

			done();
		});

		test.testXhr.status = 400;
		test.testXhr.response = JSON.stringify(responseData);

		test.testXhr.onload();
	});

	it("should handle error", (done) => {
		const test = doTest((data) => {
			expect(data.state).toEqual(FILE_STATES.ERROR);

			done();
		}, true);

		test.testXhr.onerror();
	});

	it("should handle timeout", (done) => {

		const test = doTest((data) => {
			expect(data.state).toEqual(FILE_STATES.ERROR);

			done();
		}, true);

		test.testXhr.ontimeout();
	});

});