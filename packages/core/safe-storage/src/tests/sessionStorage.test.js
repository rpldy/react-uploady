import "@rpldy/shared/src/tests/mocks/rpldy-shared.mock";
import { hasWindow } from "@rpldy/shared";

describe("sessionStorage tests", () => {
    describe("supported tests", () => {
        let safeSessionStorage;

        beforeAll(async() => {
            hasWindow.mockReturnValueOnce(true);
            const sss = await import("../sessionStorage");
            safeSessionStorage = sss.default;
        });

        it("should be supported", () => {
            expect(safeSessionStorage.isSupported).toBe(true);
        });

        it("should set & get successfully", () => {
            safeSessionStorage.setItem("test", "1234");
            expect(safeSessionStorage.getItem("test")).toBe("1234");
        });

        it("should have right length", () => {
            safeSessionStorage.setItem("test", "1234");
            safeSessionStorage.setItem("test2", "12345");

            expect(safeSessionStorage.length).toBe(2);
        });

        it("should clear successfully", () => {
            safeSessionStorage.setItem("test", "1234");
            safeSessionStorage.setItem("test2", "12345");
            safeSessionStorage.clear();
            expect(safeSessionStorage.getItem("test")).toBeNull();
            expect(safeSessionStorage.length).toBe(0);
        });

        it("should return right key", () => {
            safeSessionStorage.setItem("test", "1234");
            expect(safeSessionStorage.key(0)).toBe("test");
        });
    });

	describe("no sessionStorage", () => {
		const orgStorage = window.sessionStorage;
		let safeSessionStorage;

		beforeAll(async () => {
			delete window.sessionStorage;
			delete global._sessionStorage;

			vi.resetModules();
            hasWindow.mockReturnValueOnce(true);
            const sss = await import("../sessionStorage");
            safeSessionStorage = sss.default;
		});

        beforeEach(() => {
            hasWindow.mockReturnValueOnce(true);
        });

		afterAll(() => {
			window.sessionStorage = global._sessionStorage = orgStorage;
		});

		it("should be unsupported", () => {
			expect(safeSessionStorage.isSupported).toBe(false);
		});

		it("length should always be 0", () => {
			safeSessionStorage.setItem("test", "123");
			safeSessionStorage.setItem("test2", "1234");
			expect(safeSessionStorage.length).toBe(0);
		});

		it("should always return null", () => {
			safeSessionStorage.setItem("test", "123");
			expect(safeSessionStorage.getItem("test")).toBeUndefined();
			expect(safeSessionStorage.getItem("test2")).toBeUndefined();
		});
	});

    describe("unsupported tests", () => {
        const orgStorage = window.sessionStorage;
        let safeSessionStorage;

        beforeAll(async () => {
            window.sessionStorage = global._sessionStorage = {
                setItem: () => {
                    throw new Error("test");
                }
            };

            vi.resetModules();
            hasWindow.mockReturnValueOnce(true);
            const sss = await import("../sessionStorage");
            safeSessionStorage = sss.default;
        });

        afterAll(() => {
            window.sessionStorage = global._sessionStorage = orgStorage;
        });

        it("should be unsupported", () => {
            expect(safeSessionStorage.isSupported).toBe(false);
        });

        it("length should always be 0", () => {
            safeSessionStorage.setItem("test", "123");
            safeSessionStorage.setItem("test2", "1234");
            expect(safeSessionStorage.length).toBe(0);
        });

        it("should always return null", () => {
            safeSessionStorage.setItem("test", "123");
            expect(safeSessionStorage.getItem("test")).toBeUndefined();
            expect(safeSessionStorage.getItem("test2")).toBeUndefined();
        });
    });
});
