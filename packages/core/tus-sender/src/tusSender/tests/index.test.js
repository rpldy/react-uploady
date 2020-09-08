import { createChunkedSender } from "@rpldy/chunked-sender";
import { logger } from "@rpldy/shared/src/tests/mocks/rpldy-shared.mock";
import getTusSend from "../tusSend";
import handleEvents from "../handleEvents";
import createTusSender from "../index";

jest.mock("@rpldy/chunked-sender", () => ({
	createChunkedSender: jest.fn(),
}));

jest.mock("../../utils", () => ({
	getMandatoryOptions: jest.fn((opts) => ({ ...opts }))
}));

jest.mock("../tusSend", () => jest.fn());
jest.mock("../handleEvents", () => jest.fn());

describe("tusSender index tests", () => {

	beforeEach(() => {
		clearJestMocks(
			createChunkedSender,
			handleEvents,
			getTusSend
		);
	});

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

		const sender = createTusSender(uploader, options, "trigger");

		sender.send();

		return {
			tusSend,
			uploader,
			chunkedSender,
			options,
			sender,
		};
	};

	it("should return tus send", () => {
		logger.isDebugOn.mockReturnValueOnce(true);

		const { tusSend, uploader, chunkedSender, options } = doTest();

		expect(tusSend).toHaveBeenCalled();
		expect(handleEvents).toHaveBeenCalledWith(uploader, expect.any(Object), chunkedSender);

		const tusState = handleEvents.mock.calls[0][1];

		const state = tusState.getState();
		expect(state.items).toEqual({});

		const usedOptions = { ...options, chunked: true };
		expect(state.options).toEqual(usedOptions);
		expect(createChunkedSender).toHaveBeenCalledWith(usedOptions, "trigger");
	});

	it("should return getOptions", () => {
		const { sender, options } = doTest();

		const tusState = handleEvents.mock.calls[0][1];

		const usedOptions = { ...options, chunked: true };
		expect(sender.getOptions()).toEqual(usedOptions);

		tusState.updateState((state) => {
			state.options.deferLength = true;
		});

		expect(sender.getOptions()).toEqual({
			...usedOptions,
			deferLength: true,
		});
	});

	it("should pass deferLength", () => {
		const { options } = doTest({
			sendDataOnCreate: false,
			deferLength: true,
		});

		const tusState = handleEvents.mock.calls[0][1];

		const state = tusState.getState();

		const usedOptions = { ...options, chunked: true };
		expect(state.options).toEqual(usedOptions);
		expect(createChunkedSender).toHaveBeenCalledWith(usedOptions, "trigger");
	});

	it("should disable deferLength with sendDataOnCreate", () => {
		const { options } = doTest({
			sendDataOnCreate: true,
			deferLength: true,
		});

		const tusState = handleEvents.mock.calls[0][1];

		const state = tusState.getState();

		const usedOptions = {
			...options,
			deferLength: false,
			chunked: true
		};

		expect(state.options).toEqual(usedOptions);
		expect(createChunkedSender).toHaveBeenCalledWith(usedOptions, "trigger");
	});

	it("should disable deferLength with parallel", () => {
		const { options } = doTest({
			parallel: true,
			deferLength: true,
		});

		const tusState = handleEvents.mock.calls[0][1];

		const state = tusState.getState();

		const usedOptions = {
			...options,
			deferLength: false,
			chunked: true
		};

		expect(state.options).toEqual(usedOptions);
		expect(createChunkedSender).toHaveBeenCalledWith(usedOptions, "trigger");
	});
});
