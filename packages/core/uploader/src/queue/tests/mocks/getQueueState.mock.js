import createState from "@rpldy/simple-state";

vi.mock("@rpldy/simple-state", async () => {
    const org = await vi.importActual("@rpldy/simple-state");
    const mocked = vi.fn((...args) => org.createState(...args));

    return {
        default: mocked,
        createState: mocked,
        unwrap: vi.fn((obj) => obj),
    };
});

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
		getState: vi.fn(() => state),
		getCurrentActiveCount: vi.fn(() => state.activeIds.length),
		updateState: vi.fn(updateState),
		trigger: vi.fn(),
        runCancellable: vi.fn(),
		sender: {
			send: vi.fn(),
		},
		handleItemProgress: vi.fn(),
        clearAllUploads: vi.fn(),
        clearBatchUploads: vi.fn(),
	};
};
