const mockIsNewBatchStarting = jest.fn(),
	mockIsBatchFinished = jest.fn(),
	mockLoadNewBatchForItem = jest.fn(),
	mockCancelBatchForItem = jest.fn(),
	mockGetBatchFromItemId = jest.fn(),
	mockIsItemBelongsToBatch = jest.fn(),
	mockGetBatchDataFromItemId = jest.fn(),
	mockCleanUpFinishedBatch = jest.fn(),
	mockGetIsItemBatchReady = jest.fn();

const helpersMock = {
	isNewBatchStarting: mockIsNewBatchStarting,
	isBatchFinished: mockIsBatchFinished,
	loadNewBatchForItem: mockLoadNewBatchForItem,
	cancelBatchForItem: mockCancelBatchForItem,
	getBatchFromItemId: mockGetBatchFromItemId,
	isItemBelongsToBatch: mockIsItemBelongsToBatch,
	getBatchDataFromItemId: mockGetBatchDataFromItemId,
	cleanUpFinishedBatch: mockCleanUpFinishedBatch,
	getIsItemBatchReady: mockGetIsItemBatchReady,
};

jest.doMock("../../batchHelpers", () => helpersMock);
