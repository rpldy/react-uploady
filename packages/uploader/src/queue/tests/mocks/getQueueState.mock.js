import { getUpdateable } from "@rpldy/shared";

export default (testState, options) => {
    const { state, update } = getUpdateable({
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
