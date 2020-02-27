import React from "react";

const UploadyContext = {
    showFileUpload: jest.fn(),
    upload: jest.fn(),
    Provider: jest.fn(({ children }) =>
        <div id="uploady-context-provider">{children}</div>),
};

const assertContext = jest.fn(() => UploadyContext);

const createContextApi = jest.fn();

const withForwardRefMock = {
    setRef: jest.fn(),
    ref: { current: null },
};

const useWithForwardRef = jest.fn(() => withForwardRefMock);

const uiSharedMock = {
    UploadyContext,
    assertContext,
    createContextApi,
    useWithForwardRef,
};

jest.doMock("@rpldy/shared-ui", () => uiSharedMock);

export {
    UploadyContext,
    assertContext,
    createContextApi,
    useWithForwardRef,
    withForwardRefMock
};
