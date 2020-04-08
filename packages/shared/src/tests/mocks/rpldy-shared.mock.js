import { FILE_STATES, BATCH_STATES } from "../../consts";
import merge from "../../utils/merge";
import clone from "../../utils/clone";
import produce from "../../utils/produce";

const invariant = jest.fn();

const logger = {
	isDebugOn: jest.fn(),
	debugLog: jest.fn(),
    setDebug: jest.fn(),
};

const triggerCancellable = jest.fn();
const triggerUpdater = jest.fn();
const createBatchItem = jest.fn();

const utils = jest.genMockFromModule("../../utils");

//keep merge working - dont mock it
utils.merge.mockImplementation((...args) => merge(...args));
utils.clone.mockImplementation((...args) => clone(...args));
utils.produce.mockImplementation((...args) => produce(...args));

utils.devFreeze.mockImplementation((obj) => obj);

const sharedMock = {
	FILE_STATES,
	BATCH_STATES,

    invariant,

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

    invariant,

	logger,
	triggerCancellable,
	triggerUpdater,

	createBatchItem,

	utils,
};
