import { createChunkedSender } from "@rpldy/chunked-sender";
import getTusSend from "../tusSend";
import handleEvents from "../handleEvents";
import createTusSender from "../index";

jest.mock("@rpldy/chunked-sender", () => ({
    createChunkedSender: jest.fn(),
}));

jest.mock("../../utils", () => ({
    getMandatoryOptions: jest.fn((opts) => opts)
}));

jest.mock("../tusSend", () => jest.fn());
jest.mock("../handleEvents", () => jest.fn());

describe("tusSender index tests", () => {

	const doTest = (options) => {
		const uploader = {};

		options = {
			version: 1,
			...options
		};

		const tusSend = jest.fn(),
			chunkedSender = {};

		getTusSend.mockReturnValueOnce(tusSend);
		createChunkedSender.mockReturnValueOnce(chunkedSender);

		const sender = createTusSender(uploader, options);

		expect(createChunkedSender).toHaveBeenCalledWith(options);

		sender.send();

		return {
			tusSend,
			uploader,
			chunkedSender,
			options,
		};
	};

    it("should return tus send", () => {
		const { tusSend, uploader, chunkedSender, options } = doTest();

		expect(tusSend).toHaveBeenCalled();
		expect(handleEvents).toHaveBeenCalledWith(uploader, expect.any(Object), chunkedSender);

		const tusState = handleEvents.mock.calls[0][1];

		const state = tusState.getState();
		expect(state.items).toEqual({});
		expect(state.options).toEqual(options);
    });

	it("should pass deferLength", () => {
		const { options } = doTest({
			sendDataOnCreate: false,
			deferLength: true,
		});

		const tusState = handleEvents.mock.calls[0][1];

		const state = tusState.getState();
		expect(state.options).toEqual({
			...options,
			deferLength: true,
		});
	});

	it("should disable deferLength with sendDataOnCreate", () => {
		const { options } = doTest({
			sendDataOnCreate: true,
			deferLength: true,
		});

		const tusState = handleEvents.mock.calls[0][1];

		const state = tusState.getState();
		expect(state.options).toEqual({
			...options,
			deferLength: false,
		});
	});
});
