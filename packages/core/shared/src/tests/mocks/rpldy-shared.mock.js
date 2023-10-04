import { FILE_STATES, BATCH_STATES } from "../../consts";
import merge, { getMerge } from "../../utils/merge";
import clone from "../../utils/clone";
import pick from "../../utils/pick";
import isFunction from "../../utils/isFunction";
import isPromise from "../../utils/isPromise";
import * as utils from "../../utils";

vi.mock("../../utils");

const invariant = vi.fn();

const logger = {
    isDebugOn: vi.fn(),
    debugLog: vi.fn(),
    setDebug: vi.fn(),
};

const triggerCancellable = vi.fn();
const triggerUpdater = vi.fn();
const createBatchItem = vi.fn();
const getIsBatchItem = vi.fn();
const request = vi.fn();
const parseResponseHeaders = vi.fn();

//keep merge working - dont mock it
utils.merge = vi.fn((...args) => merge(...args));
utils.getMerge = vi.fn((...args) => getMerge(...args));
//keep clone working - dont mock it
utils.clone = vi.fn((...args) => clone(...args));
//keep pick working - dont mock it
utils.pick = vi.fn((...args) => pick(...args));
//keep isFunction working - dont mock it
utils.isFunction = vi.fn((...args) => isFunction(...args));
utils.devFreeze = vi.fn((obj) => obj);
//keep isPromise working - dont mock it
utils.isPromise = vi.fn((...args) => isPromise(...args));
//keep scheduleIdleWork working
utils.scheduleIdleWork = vi.fn((fn) => fn());

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

vi.doMock("@rpldy/shared", () => sharedMock);

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
