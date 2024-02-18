/* eslint vitest/expect-expect: ["error", { "assertFunctionNames": ["expect", "testSend"] }] */
import { mockTrigger } from "@rpldy/life-events/src/tests/mocks/rpldy-life-events.mock";
import mockSend from "@rpldy/sender";
import { SENDER_EVENTS } from "../consts";
import { DEFAULT_OPTIONS, DEFAULT_PARAM_NAME } from "../defaults";
import createItemsSender from "../batchItemsSender";

vi.mock("@rpldy/sender", () => ({ default: vi.fn() }));

describe("batchItemsSender tests", () => {
    beforeEach(() => {
        clearViMocks(
            mockTrigger,
        );
        mockSend.mockReset();
    });

    const testSend = (options = {}) => {
        options = {
            inputFieldName: "file",
            params: {
                preset: "test"
            },
            throwNoDestinationUrl: true,
            ...options,
            destination: {
                url: "test.com",
                params: {
                    foo: "bar",
                },
                headers: { "x-test": "123" },
                ...options.destination,
            },
        };

        const items = [
            { id: "u1" },
            { id: "u2" },
            { id: "u3" }
        ];

        const batch = {id: "b1"};

        const sendFn = options.send || mockSend;

        const sendResult = {result: true};
        sendFn.mockReturnValueOnce(sendResult);

        const sender = createItemsSender();

        const result = sender.send(items, batch, options);

        expect(result).toBe(sendResult);

        expect(sendFn).toHaveBeenCalledWith(items, options.destination.url, {
            method: options.destination.method || options.method || DEFAULT_OPTIONS.method,
            paramName: options.destination.filesParamName || options.inputFieldName || DEFAULT_PARAM_NAME,
            params: {
                ...options.params,
                ...options.destination.params,
            },
            forceJsonResponse: options.forceJsonResponse,
            withCredentials: options.withCredentials,
            formatGroupParamName: options.formatGroupParamName,
            headers: options.destination.headers,
			sendWithFormData: options.sendWithFormData,
        }, expect.any(Function));

        return {
            options,
            items,
            sendFn,
            batch,
        };
    };

    it("should send using default sender", () => {
        testSend();
    });

    it("should send using provided send", () => {
        const customSend = vi.fn();

        testSend({
            send: customSend,
            method: "POST",
            destination: {
                filesParamName: "fff",
                method: "PUT",
            },
            forceJsonResponse: true,
            withCredentials: true,
            formatGroupParamName: "format group name",
			sendWithFormData: true,
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
            expect(mockTrigger).toHaveBeenNthCalledWith(i + 1, SENDER_EVENTS.ITEM_PROGRESS,
                item,
                (completed / test.items.length),
                (progressEvent.loaded / test.items.length),
                progressEvent.total
            );
        });

        expect(mockTrigger).toHaveBeenNthCalledWith(test.items.length+1,
            SENDER_EVENTS.BATCH_PROGRESS,
            test.batch);
    });

    it("should use default filesParamName if none provided", () => {
        testSend({inputFieldName: null,  destination: { filesParamName: null } });
    });
});
