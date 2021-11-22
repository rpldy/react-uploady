import prepareFormData from "../prepareFormData";

describe("prepareFormData tests", () => {
    const mockFormDataSet = jest.fn();
    const paramName = "my-file";

    beforeEach(() => {
        window.FormData = function () {
            return {
                set: mockFormDataSet,
            };
        };

        clearJestMocks(mockFormDataSet);
    });

    const testPrepare = (items, options) => {
        options = {
            paramName,
            ...options
        };

        return prepareFormData(items, options);
    };

    it("should create FD for File", () => {
        const items = [{
            file: {
                name: "aaa",
            }
        }];

        testPrepare(items);

        expect(mockFormDataSet).toHaveBeenCalledTimes(1);
        expect(mockFormDataSet).toHaveBeenCalledWith(paramName, items[0].file, items[0].file.name);
    });

    it("should create FD for File like", () => {

        const items = [{
            file: {
                type: "image/jpeh"
            }
        }];

        testPrepare(items);

        expect(mockFormDataSet).toHaveBeenCalledTimes(1);
        expect(mockFormDataSet).toHaveBeenCalledWith(paramName, items[0].file, undefined);
    });

    it("should create FD for Files", () => {

        const items = [{
            file: {
                name: "aaa",
            }
        },
            {
                file: {
                    name: "bbb",
                }
            }];

        testPrepare(items);

        expect(mockFormDataSet).toHaveBeenCalledTimes(2);
        expect(mockFormDataSet).toHaveBeenCalledWith(paramName + "[0]", items[0].file, items[0].file.name);
        expect(mockFormDataSet).toHaveBeenCalledWith(paramName + "[1]", items[1].file, items[1].file.name);
    });

    it("should create FD for Files with custom name formatter", () => {
        const items = [{
            file: {
                name: "aaa",
            }
        },
            {
                file: {
                    name: "bbb",
                }
            }];

        testPrepare(items, {
            paramName: "custom",
            formatGroupParamName: (index, name) => {
                return name + "-" + index;
            }
        });

        expect(mockFormDataSet).toHaveBeenCalledTimes(2);
        expect(mockFormDataSet).toHaveBeenCalledWith("custom-0", items[0].file, items[0].file.name);
        expect(mockFormDataSet).toHaveBeenCalledWith("custom-1", items[1].file, items[1].file.name);
    });

    it("should create FD for URL", () => {

        const items = [{ url: "https://test.com" }];

        testPrepare(items);

        expect(mockFormDataSet).toHaveBeenCalledTimes(1);
        expect(mockFormDataSet).toHaveBeenCalledWith(paramName, items[0].url);
    });

    it("should create FD for unknown item", () => {
        const items = [{}];
        testPrepare(items);

        expect(mockFormDataSet).not.toHaveBeenCalled();
    });

    it("should add extra params", () => {
        const items = [{ url: "https://test.com" }];

        testPrepare(items, {
            params: {
                "foo": "bar",
                "extra": true,
            }
        });

        expect(mockFormDataSet).toHaveBeenCalledWith("foo", "bar");
        expect(mockFormDataSet).toHaveBeenCalledWith("extra", true);
        expect(mockFormDataSet).toHaveBeenCalledWith(paramName, items[0].url);
    });

    it("should use delete & append if no set", () => {
        const fdDelete = jest.fn(),
            fdAppend = jest.fn();

        window.FormData = function () {
            return {
                delete: fdDelete,
                append: fdAppend,
            };
        };

        const items = [{
            file: {
                name: "aaa",
            }
        }];

        testPrepare(items);

        expect(mockFormDataSet).not.toHaveBeenCalled();
        expect(fdDelete).toHaveBeenCalledWith(paramName);
        expect(fdAppend).toHaveBeenCalledWith(paramName, items[0].file, items[0].file.name);
    });

    it("should use append if no set or delete", () => {
        const fdAppend = jest.fn();

        window.FormData = function () {
            return {
                append: fdAppend,
            };
        };

        const items = [{
            file: {
                name: "aaa",
            }
        }];

        testPrepare(items);

        expect(mockFormDataSet).not.toHaveBeenCalled();
        expect(fdAppend).toHaveBeenCalledWith(paramName, items[0].file, items[0].file.name);
    });

    describe("undefined values", () => {
        it("should not add undefined values by default", () => {
            const items = [{
                file: {
                    name: "aaa",
                }
            }];

            testPrepare(items, {
                params: {
                    "foo": undefined,
                }
            });

            expect(mockFormDataSet).toHaveBeenCalledTimes(1);
        });

        it("should add undefined values when formDataAllowUndefined = true", () => {
            const items = [{
                file: {
                    name: "aaa",
                }
            }];

            testPrepare(items, {
                formDataAllowUndefined: true,
                params: {
                    "foo": undefined,
                }
            });

            expect(mockFormDataSet).toHaveBeenCalledTimes(2);
            expect(mockFormDataSet).toHaveBeenCalledWith("foo", undefined);
        });
    });
});
