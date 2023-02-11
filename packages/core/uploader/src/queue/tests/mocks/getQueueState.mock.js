const simpleState = jest.requireActual("@rpldy/simple-state");
const createState = simpleState.default;
export const realUnwrap = simpleState.unwrap;
createState.unwrap = jest.fn((obj) => obj);
jest.doMock("@rpldy/simple-state", () => createState);

export default (testState, options) => {
	const { state, update } = createState({
		itemQueue: {},
        batchQueue: [],
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
        runCancellable: jest.fn(),
		sender: {
			send: jest.fn(),
		},
		handleItemProgress: jest.fn(),
        clearAllUploads: jest.fn(),
        clearBatchUploads: jest.fn(),
	};
};
