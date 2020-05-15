// import safeLocalStorage from "./localStorage";

describe("localStorage tests", () => {

    describe("supported tests", () => {
        let safeLocalStorage;

        beforeAll(() => {
            safeLocalStorage = require("./localStorage");
        });

        it("should be supported", () => {
            expect(safeLocalStorage.isSupported).toBe(true);
        });

        it("should set & get successfully", () => {
            safeLocalStorage.setItem("test", "1234");
            expect(safeLocalStorage.getItem("test")).toBe("1234");
        });

        it("should have right length", () => {
            safeLocalStorage.setItem("test", "1234");
            safeLocalStorage.setItem("test2", "12345");

            expect(safeLocalStorage.length).toBe(2);
        });

        it("should clear successfully", () => {
            safeLocalStorage.setItem("test", "1234");
            safeLocalStorage.setItem("test2", "12345");
            safeLocalStorage.clear();
            expect(safeLocalStorage.getItem("test")).toBe(null);
            expect(safeLocalStorage.length).toBe(0);
        });

        it("should return right key", () => {
            safeLocalStorage.setItem("test", "1234");
            expect(safeLocalStorage.key(0)).toBe("test");
        });
    });

    describe("unsupported tests", () => {
        const orgStorage = window.localStorage;
        let safeLocalStorage;

        beforeAll(() => {
            window.localStorage = global._localStorage = {
                setItem: () => {
                    throw new Error("test");
                }
            };

            jest.resetModules();
            safeLocalStorage = require("./localStorage").default;
        });

        afterAll(() => {
            window.localStorage = global._localStorage = orgStorage;
        });

        it("should be unsupported", () => {
            expect(safeLocalStorage.isSupported).toBe(false);
        });

        it("length should always be 0", () => {
            safeLocalStorage.setItem("test", "123");
            safeLocalStorage.setItem("test2", "1234");
            expect(safeLocalStorage.length).toBe(0);
        });

        it("should always return null", () => {
            safeLocalStorage.setItem("test", "123");
            expect(safeLocalStorage.getItem("test")).toBe(null);
            expect(safeLocalStorage.getItem("test2")).toBe(null);
        });
    });
});
