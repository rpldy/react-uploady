import React from "react";
import UploadyContextMock from "./UploadyContext.mock";

const assertContext = jest.fn(() => UploadyContextMock);

const createContextApi = jest.fn();

const withForwardRefMock = {
    setRef: jest.fn(),
    ref: { current: null },
};

const useWithForwardRef = jest.fn(() => withForwardRefMock);

const useBatchStartListener = jest.fn();

const logWarning = jest.fn();

const useUploader = jest.fn();

const useUploadOptions = jest.fn();

const NoDomUploady = jest.fn(({ children }) => <div>{children}</div>);

const uiSharedMock = {
    UploadyContext: UploadyContextMock,
    NoDomUploady,

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
    useUploader,
    useUploadOptions,
    logWarning,
};

jest.doMock("@rpldy/shared-ui", () => uiSharedMock);

export {
    UploadyContextMock as UploadyContext,
    NoDomUploady,
    assertContext,
    createContextApi,
    useWithForwardRef,
    withForwardRefMock,

    useBatchStartListener,

    useUploader,
    useUploadOptions,

    logWarning,
};
