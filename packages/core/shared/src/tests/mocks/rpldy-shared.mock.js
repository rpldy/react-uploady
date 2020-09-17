import { FILE_STATES, BATCH_STATES } from "../../consts";
import merge, { getMerge } from "../../utils/merge";
import clone from "../../utils/clone";
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
utils.getMerge.mockImplementation((...args) => getMerge(...args));
//keep clone working - dont mock it
utils.clone.mockImplementation((...args) => clone(...args));
//keep pick working - dont mock it
utils.pick.mockImplementation((...args) => pick(...args));

utils.devFreeze.mockImplementation((obj) => obj);

const hasWindowFn = jest.fn(() => true);

const hasWindowMock = {
    get hasWindow () {
        return hasWindowFn();
    }
}

const hasWindowMockFn = hasWindowMock.hasWindowFn;

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

    ...hasWindowMock,
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

    hasWindowMockFn,
};
