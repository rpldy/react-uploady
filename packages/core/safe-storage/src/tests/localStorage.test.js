import "@rpldy/shared/src/tests/mocks/rpldy-shared.mock";
import { hasWindow } from "@rpldy/shared";

describe("localStorage tests", () => {
    describe("supported tests", () => {
        let safeLocalStorage;

        beforeAll(async () => {
            hasWindow.mockReturnValueOnce(true);
            const ls = await import("../localStorage");
            safeLocalStorage = ls.default;
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
            expect(safeLocalStorage.getItem("test")).toBeNull();
            expect(safeLocalStorage.length).toBe(0);
        });

        it("should return right key", () => {
            safeLocalStorage.setItem("test", "1234");
            expect(safeLocalStorage.key(0)).toBe("test");
        });
    });

	describe("no localStorage", () => {
		const orgStorage = window.localStorage;
		let safeLocalStorage;

		beforeAll(async () => {
			delete window.localStorage;
			delete global._localStorage;

			vi.resetModules();
            hasWindow.mockReturnValueOnce(true);
            const ls = await import("../localStorage");
            safeLocalStorage = ls.default;
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
			expect(safeLocalStorage.getItem("test")).toBeUndefined();
			expect(safeLocalStorage.getItem("test2")).toBeUndefined();
		});
	});

    describe("unsupported tests", () => {
        const orgStorage = window.localStorage;
        let safeLocalStorage;

        beforeAll(async () => {
            window.localStorage = global._localStorage = {
                setItem: () => {
                    throw new Error("test");
                }
            };

            vi.resetModules();
            hasWindow.mockReturnValueOnce(true);
            const ls = await import("../localStorage");
            safeLocalStorage = ls.default;
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
            expect(safeLocalStorage.getItem("test")).toBeUndefined();
            expect(safeLocalStorage.getItem("test2")).toBeUndefined();
        });
    });
});
