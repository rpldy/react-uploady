// import createState from "@rpldy/simple-state";

import { unwrap } from "@rpldy/simple-state";

const createState = jest.requireActual("@rpldy/simple-state").default;
createState.unwrap = jest.fn((obj)=>obj);
jest.doMock( "@rpldy/simple-state", () => createState);

console.log("!!!!!!!!! create state mock - ", createState)
console.log("!!!!!!!!! create state mock unwrap - ", unwrap)

// const createState = require( "@rpldy/simple-state").default;

export default (testState, options) => {
    const { state, update } = createState({
        itemQueue: [],
        currentBatch: null,
        batches: {},
        items: {},
        activeIds: [],
        ...testState
    });

    options = {
        ...options,
    };

    const updateState = (updater) => {
        update(updater);
    };

    return {
        state,
        getOptions: () => options,
        getState: jest.fn(() => state),
        getCurrentActiveCount: jest.fn(() => state.activeIds.length),
        updateState: jest.fn(updateState),
        trigger: jest.fn(),
        cancellable: jest.fn(),
        sender: {
            send: jest.fn(),
        },
        handleItemProgress: jest.fn(),
    };
};
