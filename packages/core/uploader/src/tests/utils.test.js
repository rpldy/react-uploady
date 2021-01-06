import "@rpldy/shared/src/tests/mocks/rpldy-shared.mock";
import { isProduction, hasWindow } from "@rpldy/shared";
import { unwrap, isProxiable, isProxy } from "@rpldy/simple-state";
import { deepProxyUnwrap, getMandatoryOptions } from "../utils";

jest.mock("@rpldy/simple-state");

describe("uploader utils tests", () => {

    beforeEach(() => {
        clearJestMocks(unwrap, isProxiable, isProxy);
    });

    describe("getMandatoryOptions tests", () => {
        it("should update options", () => {

            const options = getMandatoryOptions({ clearPendingOnAdd: true, destination: { url: "test.com" } });

            expect(options.autoUpload).toBe(true);
            expect(options.destination.params).toBeDefined();
            expect(options.destination.url).toBe("test.com");
            expect(options.clearPendingOnAdd).toBe(true);
            expect(options.destination.filesParamName).toBeUndefined();``
        });

        it("should set destination to null if not provided", () => {
            const options = getMandatoryOptions({ clearPendingOnAdd: true });
            expect(options.autoUpload).toBe(true);
            expect(options.destination).toBe(null);
        });
    });

    describe("getIsFileList tests", () => {
        let getIsFileList;

        beforeAll(() => {
            jest.resetModules();
            hasWindow.mockReturnValueOnce(true);
            getIsFileList = require("../utils").getIsFileList;
        });

        it("should return false for non FileList", () => {
            expect(getIsFileList([])).toBe(false);
            expect(getIsFileList({})).toBe(false);
            expect(getIsFileList(true)).toBe(false);
        });

        it("should be true for FileList", () => {
            const input = document.createElement("input");
            input.type = "file";
            document.body.appendChild(input);

            const fl = input.files;
            expect(getIsFileList(fl)).toBe(true);
        });

        it("should be true for [object FileList]", () => {
            const fl = {};
            fl.toString = () => "[object FileList]";
            expect(getIsFileList(fl)).toBe(true);
        });
    });

    describe("deepProxyUnwrap", () => {

        it("should do nothing if no proxy", () => {
            const obj = { test: true };

            isProxy.mockReturnValueOnce(false);

            const result = deepProxyUnwrap(obj);

            expect(result).toBe(obj);
        });

        it("should unwrap on level 0", () => {
            const obj = { test: true, items: ["a", "b"] };

            isProxy.mockReturnValueOnce(true);
            unwrap.mockReturnValueOnce(0);

            const result = deepProxyUnwrap(obj);

            expect(result).toBe(0);

            expect(unwrap).toHaveBeenCalledTimes(1);
        });

        it("should keep symbols", () => {
            const TEST_SYM_UNWRAP = Symbol.for("TEST_SYM_UNWRAP");
            const obj = { test: true, items: ["a", "b"], [TEST_SYM_UNWRAP]: true };

            isProxy.mockReturnValueOnce(false);
            const result = deepProxyUnwrap(obj);

            expect(result[TEST_SYM_UNWRAP]).toBe(true);
        });

        it("should unwrap array items on level 0", () => {
            const arr = ["a", "b"];

            isProxy.mockReturnValueOnce(false)
                .mockReturnValueOnce(true)
                .mockReturnValueOnce(true);

            unwrap.mockReturnValueOnce(0)
                .mockReturnValueOnce(1);

            isProxiable.mockReturnValueOnce(true);

            const result = deepProxyUnwrap(arr);

            expect(result).toEqual([0, 1]);
            expect(unwrap).toHaveBeenCalledTimes(2);
        });

        it("should unwrap array items on level 1", () => {
            const obj = {
                items: ["a", "b"]
            };

            isProxy.mockReturnValueOnce(false)
                .mockReturnValueOnce(false)
                .mockReturnValueOnce(true)
                .mockReturnValueOnce(true);

            isProxiable
                .mockReturnValueOnce(true)
                .mockReturnValueOnce(true);

            unwrap.mockReturnValueOnce(0)
                .mockReturnValueOnce(1);

            const result = deepProxyUnwrap(obj);

            expect(result).toEqual({ items: [0, 1] });
            expect(unwrap).toHaveBeenCalledTimes(2);
        });

        it("should unwrap object on level 1", () => {
            const obj = { child: { test: 1 }, child2: { test: 2 } };

            isProxy
                .mockReturnValueOnce(false)
                .mockReturnValueOnce(true)
                .mockReturnValueOnce(true);

            unwrap
                .mockReturnValueOnce(0)
                .mockReturnValueOnce(1);

            isProxiable
                .mockReturnValueOnce(true);

            const result = deepProxyUnwrap(obj);

            expect(result).toEqual({ child: 0, child2: 1 });

            expect(unwrap).toHaveBeenCalledTimes(2);

            expect(unwrap).toHaveBeenNthCalledWith(1, { test: 1 });
            expect(unwrap).toHaveBeenNthCalledWith(2, { test: 2 });
        });

        it("should unwrap object on level 2", () => {
            const obj = { child: { gchild: { test: 1 }, gchild2: { test: 2 } } };

            isProxy
                .mockReturnValueOnce(false)
                .mockReturnValueOnce(false)
                .mockReturnValueOnce(true)
                .mockReturnValueOnce(true);

            unwrap
                .mockReturnValueOnce(0)
                .mockReturnValueOnce(1);

            isProxiable
                .mockReturnValueOnce(true)
                .mockReturnValueOnce(true);

            const result = deepProxyUnwrap(obj);

            expect(result).toEqual({ child: { gchild: 0, gchild2: 1 } });

            expect(unwrap).toHaveBeenCalledTimes(2);
            expect(unwrap).toHaveBeenNthCalledWith(1, { test: 1 });
            expect(unwrap).toHaveBeenNthCalledWith(2, { test: 2 });
        });

        it("should not unwrap object on level 3", () => {

            const obj = { child: { gchild: { ggchild: { test: true } } } };

            isProxy
                .mockReturnValueOnce(false)
                .mockReturnValueOnce(false)
                .mockReturnValueOnce(false)
                .mockReturnValueOnce(true);

            isProxiable
                .mockReturnValueOnce(true)
                .mockReturnValueOnce(true)
                .mockReturnValueOnce(true);

            const result = deepProxyUnwrap(obj);

            expect(result).toStrictEqual(obj);
            expect(unwrap).toHaveBeenCalledTimes(0);
            expect(isProxiable).toHaveBeenCalledTimes(3);
        });

        it("should return same obj in production", () => {
            isProduction.mockReturnValueOnce(true);

            const obj = {test: true};

            expect(deepProxyUnwrap(obj)).toBe(obj);
        });
    });
});
