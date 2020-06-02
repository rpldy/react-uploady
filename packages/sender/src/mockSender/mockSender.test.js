import { FILE_STATES } from "@rpldy/shared";
import { MOCK_DEFAULTS } from "./defaults";
import createMockSender from "./mockSender";

describe("mockSender tests", () => {

    const onProgress = jest.fn();

    beforeEach(() => {
        jest.useFakeTimers();

        clearJestMocks(onProgress);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    const customOptions = {
        delay: 1000,
        fileSize: 50000,
        progressIntervals: [25, 50, 80],
        response: { test: true },
    };

    const items = [1, 2, 3];

    const doMockSend = (options = {}, updatedOptions = {}, abort = false, noProgressCb = false) => {

        const sender = createMockSender(options);

        if (updatedOptions) {
            sender.update(updatedOptions);
        }

        const result = sender.send(items, null, null, !noProgressCb && onProgress);

        if (abort) {
            jest.advanceTimersByTime(100);
            result.abort();
        } else {
            const delay = (options && options.delay) ||
                (updatedOptions && updatedOptions.delay) || MOCK_DEFAULTS.delay;

            if (options?.delay === 0) {
                jest.runAllTimers();
                jest.runAllImmediates();
            } else {
                jest.advanceTimersByTime(delay);
            }
        }

        return result;
    };

    it("should send mock request with defaults", async () => {

        const result = await doMockSend().request;
        const response = result.response;

        expect(response.time).toBeGreaterThan(0);
        expect(response.headers).toEqual({ "x-request-type": "react-uploady.mockSender" });
        expect(response.data).toEqual({ mock: true, success: true });
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

        expect(response.time).toBeGreaterThan(0);
        expect(response.data).toEqual({ mock: true, success: true });
        expect(response.progressEvents).toHaveLength(0);
        expect(result.state).toBe(FILE_STATES.FINISHED);
    });

    it("should emit progress events with options.fileSize = 0", async () => {

        const result = await doMockSend({
            fileSize: 0,
        }).request;

        const response = result.response;

        expect(response.time).toBeGreaterThan(0);
        expect(response.data).toEqual({ mock: true, success: true });
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
});
