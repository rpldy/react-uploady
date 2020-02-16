jest.mock("@rpldy/sender", () => jest.fn());
import { mockTrigger } from "@rpldy/life-events/src/tests/mocks/rpldy-life-events.mock";
import mockSend from "@rpldy/sender";
import { SENDER_EVENTS } from "../consts";
import { DEFAULT_OPTIONS, DEFAULT_PARAM_NAME } from "../defaults";
import createItemsSender from "../batchItemsSender";

describe("batchItemsSender tests", () => {

	beforeEach(() => {
		clearJestMocks(
			mockSend,
			mockTrigger,
		)
	});

	const testSend = (options = {}) => {
		options = {
			inputFieldName: "file",
			params: {
				preset: "test"
			},
			...options,
			destination: {
				url: "test.com",
				params: {
					foo: "bar",
				},
				headers: {"x-test": "123"},
				...options.destination,
			},
		};

		const items = [
			{ id: "u1" },
			{ id: "u2" },
			{ id: "u3" }
		];

		const sendFn = options.send || mockSend;

		const sendResult = {};
		sendFn.mockReturnValueOnce(sendResult);

		const sender = createItemsSender();

		const result = sender.send(items, options);

		expect(result).toBe(sendResult);

		expect(sendFn).toHaveBeenCalledWith(items, options.destination.url, {
			method: options.method || DEFAULT_OPTIONS.method,
			paramName: options.destination.filesParamName || options.inputFieldName || DEFAULT_PARAM_NAME,
			params: {
				...options.params,
				...options.destination.params,
			},
			forceJsonResponse: options.forceJsonResponse,
			withCredentials: options.withCredentials,
			formatGroupParamName: options.formatGroupParamName,
			headers: options.destination.headers,
		}, expect.any(Function));

		return {
			options,
			items,
			sendFn,
		}
	};

	it("should send using default sender", () => {
		testSend();
	});

	it("should send using provided send", () => {

		const customSend = jest.fn();

		testSend({
			send: customSend,
			method: "POST",
			destination: {
				filesParamName: "fff",
			},
			forceJsonResponse: true,
			withCredentials: true,
			formatGroupParamName: "format group name",
		});

		expect(mockSend).not.toHaveBeenCalled();
	});

	it("should trigger progress event", () => {
		const test = testSend();

		const progressEvent = {
			loaded: 2000,
			total: 10000,
		};

		test.sendFn.mock.calls[0][3](progressEvent);

		test.items.forEach((item, i) => {
			const completed = (progressEvent.loaded / progressEvent.total) * 100;
			expect(mockTrigger).toHaveBeenNthCalledWith(i + 1, SENDER_EVENTS.PROGRESS,
				item,
				(completed / test.items.length),
				(progressEvent.loaded / test.items.length)
			);
		});
	});
});
