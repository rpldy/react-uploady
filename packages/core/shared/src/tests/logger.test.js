import { DEBUG_LOG_KEY } from "../consts";

describe("logger tests", () => {

    let logger, hasWindow;

    const resetLogger = (resetWindow = true) => {
        jest.resetModules();
        if (resetWindow) {
            window[DEBUG_LOG_KEY] = undefined;
        }
        jest.doMock("../utils/hasWindow", () => jest.fn(() => true));
        logger = require("../logger");
        hasWindow = require("../utils/hasWindow");
    };

    beforeEach(() => {
        resetLogger();
    });

    afterEach(() => {
        jest.resetModules();
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

    it("should not set debug without window", () => {
        hasWindow.mockReturnValueOnce(false);
        logger.setDebug(true);
        resetLogger(false);
        expect(logger.isDebugOn()).toBe(false);
    });

    it("should write to console when debug enabled", () => {
        const consoleLog = jest.spyOn(console, "log")
            .mockImplementationOnce(() => {
            });

        logger.setDebug(true);
        logger.debugLog("hello", 1, { foo: "bar" });
        expect(consoleLog).toHaveBeenCalledWith("hello", 1, { foo: "bar" });

        consoleLog.mockRestore();
    });

    it("should not write to console when debug disabled", () => {
        const consoleLog = jest.spyOn(console, "log");

        logger.debugLog("hello", 1, { foo: "bar" });
        expect(consoleLog).not.toHaveBeenCalled();

        consoleLog.mockRestore();
    });

    it("should use debug from url param", () => {
        jsdom.reconfigure({
            url: "https://test.com/?foo=bar&rpldy_debug=true"
        });

        expect(logger.isDebugOn()).toBe(true);
    });
});
