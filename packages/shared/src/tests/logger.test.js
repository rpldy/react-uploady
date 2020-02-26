import { DEBUG_LOG_KEY } from "../consts";

describe("logger tests", () => {

    let logger;
    beforeEach(() => {
        logger = require("../logger");
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

    it("should write to console when debug enabled", () => {
        const consoleLog = jest.spyOn(console, "log")
            .mockImplementationOnce(()=>{});

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

        jest.resetModules();
        logger = require("../logger");

        expect(logger.isDebugOn()).toBe(true);
    });
});
