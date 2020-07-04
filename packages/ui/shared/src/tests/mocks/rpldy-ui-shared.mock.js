import React from "react";

const UploadyContext = {
    showFileUpload: jest.fn(),
    getOptions: jest.fn(),
    setOptions: jest.fn(),
    setExternalFileInput: jest.fn(),
    upload: jest.fn(),
    getExtension: jest.fn(),
	on: jest.fn(),
	off: jest.fn(),
    Provider: jest.fn(({ children }) => {
        return <div id="uploady-context-provider">{children}</div>
    }),
};

const assertContext = jest.fn(() => UploadyContext);

const createContextApi = jest.fn();

const withForwardRefMock = {
    setRef: jest.fn(),
    ref: { current: null },
};

const useWithForwardRef = jest.fn(() => withForwardRefMock);

const useBatchStartListener = jest.fn();

const logWarning = jest.fn();

const uiSharedMock = {
    UploadyContext,
    assertContext,
    createContextApi,
    useWithForwardRef,
    // useBatchAddListener,
    useBatchStartListener,
    // useBatchProgressListener,
    // useBatchFinishListener,
    // useBatchCancelledListener,
    // useBatchAbortListener,
    // useItemStartListener,
    // useItemFinishListener,
    // useItemProgressListener,
    // useItemCancelListener,
    // useItemErrorListener,
    // useRequestPreSend,

    logWarning,
};

jest.doMock("@rpldy/shared-ui", () => uiSharedMock);

export {
    UploadyContext,
    assertContext,
    createContextApi,
    useWithForwardRef,
    withForwardRefMock,

    useBatchStartListener,

    logWarning,
};
