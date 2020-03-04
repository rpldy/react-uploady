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

		prepareFormData(items, options);
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
        const items = [{ }];
        testPrepare(items);
    });

	it("should add extra params", () => {

		const items = [{ url: "https://test.com" }];

		testPrepare(items, {
			params: {
				"foo": "bar",
				"extra": true,
			}
		});

		expect(mockFormDataSet).toHaveBeenCalledWith(paramName, items[0].url);
		expect(mockFormDataSet).toHaveBeenCalledWith("foo", "bar");
		expect(mockFormDataSet).toHaveBeenCalledWith("extra", true);
	});
});
