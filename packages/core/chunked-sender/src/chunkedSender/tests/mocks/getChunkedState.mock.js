const getChunkedState = (state = {}) => {
    const getState = vi.fn(() => state);

    const updateState = vi.fn((updater) => {
        updater(state);
    });

    return {
        getState,
        updateState,
    };
}

export default getChunkedState;
