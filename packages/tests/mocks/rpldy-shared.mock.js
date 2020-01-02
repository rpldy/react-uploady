const logger = {
	isDebugOn: jest.fn(),
};

const sharedMock = { logger, };

jest.doMock("@rpldy/shared", () => sharedMock);

export {
	logger,
};