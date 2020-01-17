import produce from "immer";

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

	const updateState = (updater) => {
		state = produce(state, updater);
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
		}
	};
};