const mockIsNewBatchStarting = jest.fn(),
    mockIncrementBatchFinishedCounter = jest.fn(),
	mockLoadNewBatchForItem = jest.fn(),
	mockCancelBatchForItem = jest.fn(),
	mockGetBatchFromItemId = jest.fn(),
	mockIsItemBelongsToBatch = jest.fn(),
	mockGetBatchDataFromItemId = jest.fn(),
	mockCleanUpFinishedBatches = jest.fn(),
	mockGetIsBatchReady = jest.fn(),
    mockFailBatchForItem = jest.fn(),
    mockIsItemBatchStartPending = jest.fn();

const helpersMock = {
	isNewBatchStarting: mockIsNewBatchStarting,
    incrementBatchFinishedCounter: mockIncrementBatchFinishedCounter,
	loadNewBatchForItem: mockLoadNewBatchForItem,
	cancelBatchForItem: mockCancelBatchForItem,
    failBatchForItem: mockFailBatchForItem,
	getBatchFromItemId: mockGetBatchFromItemId,
	isItemBelongsToBatch: mockIsItemBelongsToBatch,
	getBatchDataFromItemId: mockGetBatchDataFromItemId,
	cleanUpFinishedBatches: mockCleanUpFinishedBatches,
    getIsBatchReady: mockGetIsBatchReady,
    isItemBatchStartPending: mockIsItemBatchStartPending,
};

jest.doMock("../../batchHelpers", () => helpersMock);
