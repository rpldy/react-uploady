import { FILE_STATES, BATCH_STATES } from "../../consts";
import merge from "../../utils/merge";
import clone from "../../utils/clone";
import getUpdateable from "../../utils/updateable";
import pick from "../../utils/pick";

const invariant = jest.fn();

const logger = {
	isDebugOn: jest.fn(),
	debugLog: jest.fn(),
    setDebug: jest.fn(),
};

const triggerCancellable = jest.fn();
const triggerUpdater = jest.fn();
const createBatchItem = jest.fn();
const request = jest.fn();
const parseResponseHeaders = jest.fn();

const utils = jest.genMockFromModule("../../utils");

//keep merge working - dont mock it
utils.merge.mockImplementation((...args) => merge(...args));
//keep clone working - dont mock it
utils.clone.mockImplementation((...args) => clone(...args));
//keep updateable working - dont mock it
utils.getUpdateable.mockImplementation((...args) => getUpdateable(...args));
//keep pick working - dont mock it
utils.pick.mockImplementation((...args) => pick(...args));

utils.devFreeze.mockImplementation((obj) => obj);

const sharedMock = {
	FILE_STATES,
	BATCH_STATES,

    invariant,

	logger,
	triggerCancellable,
	triggerUpdater,

	createBatchItem,

    request,
    parseResponseHeaders,

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

    request,
    parseResponseHeaders,

	utils,
};
