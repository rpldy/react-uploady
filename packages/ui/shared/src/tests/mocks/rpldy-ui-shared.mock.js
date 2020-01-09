const UploadyContext = {
	showFileUpload: jest.fn(),
};

const assertContext = jest.fn(() => UploadyContext);


const uiSharedMock = {
	UploadyContext,
	assertContext,
};

jest.doMock("@rpldy/shared-ui", () => uiSharedMock);

export {
	UploadyContext,
	assertContext,


};