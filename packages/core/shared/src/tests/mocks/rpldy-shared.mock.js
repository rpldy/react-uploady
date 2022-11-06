import { FILE_STATES, BATCH_STATES } from "../../consts";
import merge, { getMerge } from "../../utils/merge";
import clone from "../../utils/clone";
import pick from "../../utils/pick";
import isFunction from "../../utils/isFunction";
import isPromise from "../../utils/isPromise";

const invariant = jest.fn();

const logger = {
    isDebugOn: jest.fn(),
    debugLog: jest.fn(),
    setDebug: jest.fn(),
};

const triggerCancellable = jest.fn();
const triggerUpdater = jest.fn();
const createBatchItem = jest.fn();
const getIsBatchItem = jest.fn();
const request = jest.fn();
const parseResponseHeaders = jest.fn();

const utils = jest.genMockFromModule("../../utils");

//keep merge working - dont mock it
utils.merge = jest.fn((...args) => merge(...args));
utils.getMerge = jest.fn((...args) => getMerge(...args));
//keep clone working - dont mock it
utils.clone = jest.fn((...args) => clone(...args));
//keep pick working - dont mock it
utils.pick = jest.fn((...args) => pick(...args));
//keep isFunction working - dont mock it
utils.isFunction = jest.fn((...args) => isFunction(...args));
utils.devFreeze = jest.fn((obj) => obj);
//keep isPromise working - dont mock it
utils.isPromise = jest.fn((...args) => isPromise(...args));
//keep scheduleIdleWork working
utils.scheduleIdleWork = jest.fn((fn) => fn());

const sharedMock = {
    FILE_STATES,
    BATCH_STATES,

    invariant,

    logger,
    triggerCancellable,
    triggerUpdater,

    createBatchItem,
    getIsBatchItem,

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
    getIsBatchItem,

    request,
    parseResponseHeaders,

    utils,
};
