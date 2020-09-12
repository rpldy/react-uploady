import createTusSender from "../tusSender";
import getTusEnhancer from "../getTusEnhancer";
import { TUS_EXT } from "../consts";

jest.mock("../tusSender", () => jest.fn());

describe("getTusEnhancer tests", () => {

	it("should enhance uploader", () => {
		const options = { parallel: 2 };

		const send = jest.fn(),
			getOptions = jest.fn();

		createTusSender.mockReturnValueOnce({
			send,
			getOptions
		});

		const enhancer = getTusEnhancer(options);

		const uploader = {
			update: jest.fn(),
			registerExtension: jest.fn(),
		};

		enhancer(uploader, "trigger");

		expect(uploader.update).toHaveBeenCalledWith({ send });
		expect(createTusSender).toHaveBeenCalledWith(uploader, options, "trigger");

		expect(uploader.registerExtension).toHaveBeenCalledWith(TUS_EXT, expect.any(Object));

		uploader.registerExtension.mock.calls[0][1].getOptions();
		expect(getOptions).toHaveBeenCalled();
	});

});