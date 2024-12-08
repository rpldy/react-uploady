import { logger } from "@rpldy/shared/src/tests/mocks/rpldy-shared.mock";
import { hasWindow } from "@rpldy/shared";
import getTusSend from "../tusSend";
import createTusSender from "../createTusSender";

vi.mock("../../utils", () => ({
	getMandatoryOptions: vi.fn((opts) => ({ ...opts }))
}));

vi.mock("../tusSend", () => ({ default: vi.fn() }));

describe("tusSender index tests", () => {

	beforeEach(() => {
		clearViMocks(
			getTusSend
		);
	});

	const doTest = (options) => {
	    hasWindow.mockReturnValueOnce(true);

		const uploader = {};

		options = {
			version: 1,
			...options
		};

		const tusSend = vi.fn();

		getTusSend.mockReturnValueOnce(tusSend);

		const sender = createTusSender(uploader, options, "trigger");

		sender.send();

		return {
			tusSend,
			uploader,
			options,
			sender,
		};
	};

	it("should return tus send", () => {
		logger.isDebugOn.mockReturnValueOnce(true);

		const { tusSend,  options } = doTest();

		expect(tusSend).toHaveBeenCalled();
        const tusState = getTusSend.mock.calls[0][1];
		const state = tusState.getState();
		expect(state.items).toEqual({});

		const usedOptions = { ...options, chunked: true };
		expect(state.options).toEqual(usedOptions);
	});

	it("should return getOptions", () => {
		const { sender, options } = doTest();

        const tusState = getTusSend.mock.calls[0][1];

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

        const tusState = getTusSend.mock.calls[0][1];
		const state = tusState.getState();

		const usedOptions = { ...options, chunked: true };
		expect(state.options).toEqual(usedOptions);
	});

	it("should disable deferLength with sendDataOnCreate", () => {
		const { options } = doTest({
			sendDataOnCreate: true,
			deferLength: true,
		});

        const tusState = getTusSend.mock.calls[0][1];
		const state = tusState.getState();

		const usedOptions = {
			...options,
			deferLength: false,
			chunked: true
		};

		expect(state.options).toEqual(usedOptions);
	});

	it("should disable deferLength with parallel", () => {
		const { options } = doTest({
			parallel: true,
			deferLength: true,
		});

        const tusState = getTusSend.mock.calls[0][1];
		const state = tusState.getState();

		const usedOptions = {
			...options,
			deferLength: false,
			chunked: true
		};

		expect(state.options).toEqual(usedOptions);
	});
});
