
export default (initState = {}) => {
    let state = {
        options: {
            version: "1",
            ...initState?.options,
        },
		featureDetection: {},
        ...initState
    };

    return {
        getState: vi.fn(() => state),
        updateState: vi.fn((updater) => updater(state)),
    }
};
