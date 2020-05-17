
export default (initState = {}) => {
    let state = {
        options: {
            version: "1",
            ...initState?.options,
        },
        ...initState
    };

    return {
        getState: () => state,
        updateState: (updater) => updater(state)
    }
};
