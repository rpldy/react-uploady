const getChunkedState = (state = {}) => {
    const getState = jest.fn(() => state);

    const updateState = jest.fn((updater) => {
        updater(state);
    });

    return {
        getState,
        updateState,
    };
}

export default getChunkedState;
