
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
        getState: jest.fn(() => state),
        updateState: jest.fn((updater) => updater(state)),
    }
};
