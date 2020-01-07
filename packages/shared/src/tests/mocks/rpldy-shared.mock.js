import { FILE_STATES } from "../../consts";

const logger = {
	isDebugOn: jest.fn(),
	debugLog: jest.fn(),
};

const triggerCancellable = jest.fn();
const triggerUpdater = jest.fn();

const utils = jest.genMockFromModule("../../utils");

const sharedMock = {
	FILE_STATES,

	logger,
	triggerCancellable,
	triggerUpdater,

	...utils,
};

jest.doMock("@rpldy/shared", () => sharedMock);

export {
	FILE_STATES,

	logger,
	triggerCancellable,
	triggerUpdater,

	utils,
};