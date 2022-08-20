describe("scheduleIdleWork tests", () => {
    let hasWindow, scheduleIdleWork;
    const orgRIC = window.requestIdleCallback;

    const init = (preReq = null) => {
        jest.mock("../hasWindow");
        hasWindow = require("../hasWindow").default;

        preReq?.();

        scheduleIdleWork = require("../scheduleIdleWork").default;
    };

    afterEach(() => {
        jest.resetModules();
        window.requestIdleCallback = orgRIC;
    });

    describe("test with requestIdleCallback", () => {
        let mockRIC;

        beforeEach(() => {
            init(() => {
                mockRIC = jest.fn((fn) => fn());
                window.requestIdleCallback = mockRIC;
                hasWindow.mockReturnValueOnce(true);
            });
        });

        it("should schedule using idle callback", async () => {
            await expect(new Promise((resolve) => {
                scheduleIdleWork(() => {
                    resolve();
                });
            })).resolves.toBeUndefined();

            expect(mockRIC).toHaveBeenCalledTimes(1);
        });

        it("should schedule using idle callback with timeout", async () => {
            await expect(new Promise((resolve) => {
                scheduleIdleWork(() => {
                    resolve();
                }, 100);
            })).resolves.toBeUndefined();

            expect(mockRIC).toHaveBeenCalledWith(expect.any(Function), { timeout: 100 });
        });
    });

    describe("should fallback on setTimeout when no RIC", () => {
        beforeEach(() => {
            init(() => {
                jest.useFakeTimers();
                hasWindow.mockReturnValueOnce(true);
            });
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it("should schedule using setTimeout", async () => {
            let a = 0;

            await expect(new Promise((resolve) => {
                scheduleIdleWork(() => {
                    a = 1;
                    resolve();
                }, 100);

                expect(a).toBe(0);
                jest.advanceTimersByTime(100);
            })).resolves.toBeUndefined();

            expect(a).toBe(1);
        });

        it("should allow to cancel scheduled work", async () => {
            let a = 0;
            await expect(new Promise((resolve) => {
                const cancel = scheduleIdleWork(() => {
                    a = 1;
                }, 100);

                cancel();
                jest.advanceTimersByTime(100);
                resolve();
            })).resolves.toBeUndefined();

            expect(a).toBe(0);
        });
    });

    describe("no window tests", () => {
        beforeEach(() => {
            init(() => {
                jest.useFakeTimers();
                hasWindow.mockReturnValueOnce(false);
            });
        });

        it("should handle noWindow with setTimeout fallback", async () => {
            let a = 0;

            await expect(new Promise((resolve) => {
                scheduleIdleWork(() => {
                    a = 1;
                    resolve();
                }, 100);

                expect(a).toBe(0);
                jest.advanceTimersByTime(100);
            })).resolves.toBeUndefined();

            expect(a).toBe(1);
        });
    });
});
