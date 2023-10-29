import { FILE_STATES } from "@rpldy/shared";
import { MOCK_DEFAULTS } from "../defaults";
import createMockSender from "../mockSender";

describe("mockSender tests", () => {
    const onProgress = vi.fn();

    beforeEach(() => {
        vi.useFakeTimers();
        clearViMocks(onProgress);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    const customOptions = {
        delay: 1000,
        fileSize: 50000,
        progressIntervals: [25, 50, 80],
        response: { test: true },
    };

    const items = [1, 2, 3];

    const doMockSend = (options = {}, updatedOptions = {}, abort = false, noProgressCb = false, sendOptions = {  }) => {
        const sender = createMockSender(options);

        if (updatedOptions) {
            sender.update(updatedOptions);
        }

        const result = sender.send(items, null, sendOptions, !noProgressCb && onProgress);

        if (abort) {
            vi.advanceTimersByTime(100);
            result.abort();
        } else {
            const delay = (options && options.delay) ||
                (updatedOptions && updatedOptions.delay) || MOCK_DEFAULTS.delay;

            if (options?.delay === 0) {
                vi.runAllTimers();
            } else {
                vi.advanceTimersByTime(delay);
            }
        }

        return result;
    };

    it("should send mock request with defaults", async () => {
        const result = await doMockSend().request;
        const response = result.response;

        expect(response.time).toBeGreaterThan(0);
        expect(response.headers).toEqual({ "x-request-type": "react-uploady.mockSender" });
        expect(response.data).toEqual({ mock: true, success: true, sendOptions: { } });
        expect(response.progressEvents).toHaveLength(5);

        expect(response.progressEvents[0].total).toBe(MOCK_DEFAULTS.fileSize);
        expect(response.progressEvents[0].loaded).toBe(MOCK_DEFAULTS.fileSize / 10);
        expect(response.progressEvents[4].loaded).toBe(MOCK_DEFAULTS.fileSize * 0.99);

        expect(response.options).toEqual(MOCK_DEFAULTS);

        expect(onProgress).toHaveBeenCalledTimes(5);

        expect(onProgress).toHaveBeenNthCalledWith(1, {
            total: MOCK_DEFAULTS.fileSize,
            loaded: MOCK_DEFAULTS.fileSize / 10,
        }, items);

        expect(result.state).toBe(FILE_STATES.FINISHED);
    });

    it("should not emit progress events with 0 delay", async () => {
        const result = await doMockSend({
            delay: 0,
        }).request;

        const response = result.response;
        expect(response.data).toEqual({ mock: true, success: true, sendOptions: { } });
        expect(response.progressEvents).toHaveLength(0);
        expect(result.state).toBe(FILE_STATES.FINISHED);
    });

    it("should emit progress events with options.fileSize = 0", async () => {
        const result = await doMockSend({
            fileSize: 0,
        }).request;

        const response = result.response;

        expect(response.data).toEqual({ mock: true, success: true, sendOptions: { } });
        expect(result.state).toBe(FILE_STATES.FINISHED);

        expect(response.progressEvents).toHaveLength(5);

        expect(response.progressEvents[0].total).toBe(0);
        expect(response.progressEvents[0].loaded).toBe(0);
        expect(response.progressEvents[4].total).toBe(0);
        expect(response.progressEvents[4].loaded).toBe(0);
    });

    it("should send mock request with custom options", async () => {
        const result = await doMockSend(customOptions).request;

        const response = result.response;

        expect(response.data).toEqual(customOptions.response);
        expect(response.progressEvents).toHaveLength(3);
        expect(response.progressEvents[2].total).toBe(customOptions.fileSize);
        expect(response.progressEvents[2].loaded).toBe(customOptions.fileSize * 0.8);
        expect(response.options.delay).toBe(customOptions.delay);

        expect(onProgress).toHaveBeenCalledTimes(3);

        expect(onProgress).toHaveBeenNthCalledWith(1, {
            total: customOptions.fileSize,
            loaded: customOptions.fileSize * 0.25,
        }, items);

        expect(result.state).toBe(FILE_STATES.FINISHED);
    });

    it("should send without progress events", async () => {
        const options = {
            progressIntervals: null,
        };

        const result = await doMockSend(options).request;
        const response = result.response;
        expect(response.progressEvents).toHaveLength(0);

        expect(onProgress).not.toHaveBeenCalled();

        expect(result.state).toBe(FILE_STATES.FINISHED);
    });

    it("should use updated options", async () => {
        const result = await doMockSend(null, customOptions).request;
        const response = result.response;

        expect(response.data).toEqual(customOptions.response);
        expect(response.progressEvents).toHaveLength(3);

        expect(onProgress).toHaveBeenCalledTimes(3);

        expect(onProgress).toHaveBeenNthCalledWith(1, {
            total: customOptions.fileSize,
            loaded: customOptions.fileSize * 0.25,
        }, items);

        expect(result.state).toBe(FILE_STATES.FINISHED);
    });

    it("should abort request successfully", async () => {
        const result = await doMockSend(null, null, true).request;
        const response = result.response;

        expect(onProgress).toHaveBeenCalledTimes(1);
        expect(result.state).toBe(FILE_STATES.ABORTED);
        expect(response).toBe("abort");
    });

    it("should work without on progress callback", async () => {
        const result = await doMockSend(null, null, false, true).request;
        expect(onProgress).toHaveBeenCalledTimes(0);
        expect(result.state).toBe(FILE_STATES.FINISHED);
    });

    it("should add sendOptions to response data", async () => {
        const sendOptions = {params: [1,2]};
        const result = await doMockSend(null, null, false, false, sendOptions ).request;

        const response = result.response;

        expect(response.data.sendOptions).toEqual(sendOptions);
    });

    it("should use senOptions.formatServerResponse", async () => {
        const formatServerResponse = vi.fn(() => "test");
        const sendOptions = { formatServerResponse };

        const result = await doMockSend(null, null, false, false, sendOptions).request;

        expect(result.response.data).toBe("test");
    });

    describe("isSuccessfulCall", () => {
        it("should use sendOptions.isSuccessfulCall to fail request", async () => {
            let mockXhr;

            const isSuccessfulCall = vi.fn((xhr) => {
               mockXhr = xhr;
                return false;
            });

            const sendOptions = { isSuccessfulCall };

            const result = await doMockSend(null, null, false, false, sendOptions).request;

            expect(result.state).toBe(FILE_STATES.ERROR);
            expect(result.response.data.success).toBe(false);

            expect(mockXhr.readyState).toBe(4);
            const mockHeaders = expect(mockXhr.getAllResponseHeaders());
            expect(mockHeaders).toBeDefined();
        });

        it("should use sendOptions.isSuccessfulCall for success", async () => {
            const isSuccessfulCall = vi.fn(() => true);
            const sendOptions = { isSuccessfulCall };

            const result = await doMockSend(null, null, false, false, sendOptions).request;

            expect(result.state).toBe(FILE_STATES.FINISHED);
            expect(result.response.data.success).toBe(true);
        });

        it("should use mock sender init isSuccessfulCall", async () => {
            const isSuccessfulCall = vi.fn(() => false);

            const result = await doMockSend({ isSuccessfulCall }).request;

            expect(result.state).toBe(FILE_STATES.ERROR);
            expect(result.response.data.success).toBe(false);
        });
    });
});
