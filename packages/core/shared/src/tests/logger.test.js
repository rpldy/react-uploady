import { DEBUG_LOG_KEY } from "../consts";

describe("logger tests", () => {
    let logger, hasWindow;

    const resetLogger = async (resetWindow = true) => {
        vi.resetModules();

        if (resetWindow) {
            window[DEBUG_LOG_KEY] = undefined;
        }

        vi.doMock("../utils/hasWindow", () => ({ default: vi.fn(() => true) }));
        const hasWindowMod = await import("../utils/hasWindow");
        hasWindow = hasWindowMod.default;

        logger = await import("../logger");
    };

    beforeEach(async () => {
        await resetLogger();
    });

    afterEach(() => {
        vi.resetModules();
        window[DEBUG_LOG_KEY] = undefined;
    });

    it("should return false for debug by default", () => {
        expect(logger.isDebugOn()).toBe(false);
    });

    it.each([true, false])
    ("setDebug(%S) should set debug on/off", (state) => {
        logger.setDebug(state);
        expect(logger.isDebugOn()).toBe(state);
    });

    it("should not set debug without window", async () => {
        hasWindow.mockReturnValueOnce(false);
        logger.setDebug(true);
        await resetLogger(false);
        expect(logger.isDebugOn()).toBe(false);
    });

    it("should write to console when debug enabled", () => {
        const consoleLog = vi.spyOn(console, "log")
            .mockImplementationOnce(() => {
            });

        logger.setDebug(true);
        logger.debugLog("hello", 1, { foo: "bar" });
        expect(consoleLog).toHaveBeenCalledWith("hello", 1, { foo: "bar" });

        consoleLog.mockRestore();
    });

    it("should not write to console when debug disabled", () => {
        const consoleLog = vi.spyOn(console, "log");

        logger.debugLog("hello", 1, { foo: "bar" });
        expect(consoleLog).not.toHaveBeenCalled();

        consoleLog.mockRestore();
    });

    it("should use debug from url param", () => {
        window.location = new URL("https://test.com/?foo=bar&rpldy_debug=true");

        expect(logger.isDebugOn()).toBe(true);
    });
});
