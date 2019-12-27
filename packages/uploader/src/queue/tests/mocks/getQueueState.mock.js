export default (state, options) => {
	state = {
		itemQueue: [],
		currentBatch: null,
		batches: {},
		items: {},
		activeIds: [],
		...state
	};

	options = {
		...options,
	};

	return {
		state,
		getOptions: () => options,
		getState: jest.fn(() => state),
		getCurrentActiveCount: jest.fn(() => state.activeIds.length),
		updateState: jest.fn((updater) => updater(state)),
		trigger: jest.fn(),
		cancellable: jest.fn(),
		sender: {
			send: jest.fn(),
		}
	};
};