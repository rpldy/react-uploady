import { FILE_STATES, BATCH_STATES } from "../../consts";

const logger = {
	isDebugOn: jest.fn(),
	debugLog: jest.fn(),
    setDebug: jest.fn(),
};

const triggerCancellable = jest.fn();
const triggerUpdater = jest.fn();
const createBatchItem = jest.fn();

const utils = jest.genMockFromModule("../../utils");

utils.devFreeze.mockImplementation((obj) => obj);

const sharedMock = {
	FILE_STATES,
	BATCH_STATES,

	logger,
	triggerCancellable,
	triggerUpdater,

	createBatchItem,

	...utils,
};

jest.doMock("@rpldy/shared", () => sharedMock);

export {
	FILE_STATES,
	BATCH_STATES,

	logger,
	triggerCancellable,
	triggerUpdater,

	createBatchItem,

	utils,
};
