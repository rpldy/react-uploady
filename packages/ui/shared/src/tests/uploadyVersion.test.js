import {
    GLOBAL_VERSION_SYM,
    getVersion,
    registerUploadyContextVersion,
    getRegisteredVersion,
    getIsVersionRegisteredAndDifferent,
} from "../uploadyVersion";

describe("uploadyVersion tests", () => {

    beforeEach(() => {
        process.env.BUILD_TIME_VERSION = "0.0.0";
        delete window[GLOBAL_VERSION_SYM];
    });

    it("should return global version", () => {
        expect(getVersion()).toBe("0.0.0");
    });

    it("should register and retrieve", () => {
        expect(getRegisteredVersion()).toBeUndefined();
        registerUploadyContextVersion();
        expect(getRegisteredVersion()).toBe("0.0.0");
    });

    it("should return true if same version as registered", () => {
        expect(getIsVersionRegisteredAndDifferent()).toBe(false);
        registerUploadyContextVersion();
        expect(getIsVersionRegisteredAndDifferent()).toBe(false);
        global[GLOBAL_VERSION_SYM] = "diff";
        expect(getIsVersionRegisteredAndDifferent()).toBe(true);
    });

    it("should handle no version registered", () => {
        registerUploadyContextVersion();
        process.env.BUILD_TIME_VERSION = null;
        expect(getIsVersionRegisteredAndDifferent()).toBe(true);
    });
});
