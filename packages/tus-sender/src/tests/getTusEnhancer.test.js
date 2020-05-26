import createTusSender from "../tusSender";
import getTusEnhancer from "../getTusEnhancer";

jest.mock("../tusSender", () => jest.fn());

describe("getTusEnhancer tests", () => {

	it("should enhance uploader", () => {
		const options = { parallel: 2 };

		const send = jest.fn();

		createTusSender.mockReturnValueOnce({
			send,
		});

		const enhancer = getTusEnhancer(options);

		const uploader = {
			update: jest.fn(),
		};

		enhancer(uploader);

		expect(uploader.update).toHaveBeenCalledWith({send});
		expect(createTusSender).toHaveBeenCalledWith(uploader, options);
	});

});