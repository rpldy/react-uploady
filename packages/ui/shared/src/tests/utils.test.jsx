import React from "react";
import "@rpldy/shared/src/tests/mocks/rpldy-shared.mock";
import { isProduction } from "@rpldy/shared";
import { UPLOAD_OPTIONS_COMP } from "../consts";
import {
    logWarning,
    markAsUploadOptionsComponent,
    getIsUploadOptionsComponent,
} from "../utils";

vi.mock("../assertContext", () => jest.fn());

describe("ui-shared utils tests", () => {
    describe("logWarning test", () => {
        let mockWarn;

        beforeAll(() => {
            mockWarn = vi.spyOn(console, "warn");
            mockWarn.mockImplementation(()=>{});
        });

        afterAll(() => {
            mockWarn.mockRestore();
        });

        beforeEach(() => {
            mockWarn.mockClear();
        });

        it.each([
            false,
            null,
            undefined,
            0,
        ])("should log for falsy values : %s", (val) => {
            logWarning(val, "warning");
            expect(mockWarn).toHaveBeenCalledWith("warning");
        });

        it.each([
            true,
            {},
            "test",
            1,
        ])("shouldn't log for truthy values : %s", (val) => {
            logWarning(val, "warning");
            expect(mockWarn).not.toHaveBeenCalled();
        });

        it("should'nt log in production", () => {
            isProduction.mockReturnValueOnce(true);
            logWarning(null, "warning");
            expect(mockWarn).not.toHaveBeenCalled();
        });

    });

    describe("upload options component tests", () => {
        it.each([
            [{}, false],
            [{ target: { [UPLOAD_OPTIONS_COMP]: true } }, true],
            [{ render: { [UPLOAD_OPTIONS_COMP]: true } }, true],
        ])("getIsUploadOptionsComponent - for %s should return %s", (comp, result) => {
            expect(getIsUploadOptionsComponent(comp)).toBe(result);
        });

        it("should mark as UploadOptionsComponent", () => {
            const MyComp = () => {
                return <div/>;
            };

            markAsUploadOptionsComponent(MyComp);

            expect(getIsUploadOptionsComponent(MyComp)).toBe(true);
        });
    });
});
