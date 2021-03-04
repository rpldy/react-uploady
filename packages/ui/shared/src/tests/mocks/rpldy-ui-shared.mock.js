import React from "react";
import UploadyContextMock from "./UploadyContext.mock";

const assertContext = jest.fn(() => UploadyContextMock);

const createContextApi = jest.fn();

const withForwardRefMock = {
    setRef: jest.fn(),
    ref: { current: null },
};

const useBatchStartListener = jest.fn();

const logWarning = jest.fn();

const useUploadyContext = jest.fn(() => UploadyContextMock);
const useUploady = useUploadyContext;

const useUploader = jest.fn();

const useUploadOptions = jest.fn();

const NoDomUploady = jest.fn(({ children }) => <div>{children}</div>);

const markAsUploadOptionsComponent = jest.fn();
const getIsUploadOptionsComponent = jest.fn();

const uiSharedMock = {
    UploadyContext: UploadyContextMock,
    NoDomUploady,

    assertContext,
    createContextApi,
    useUploadyContext,
    useUploady,
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
    markAsUploadOptionsComponent,
    getIsUploadOptionsComponent,
};

jest.doMock("@rpldy/shared-ui", () => uiSharedMock);

export {
    UploadyContextMock as UploadyContext,
    NoDomUploady,
    assertContext,
    createContextApi,
    withForwardRefMock,

    useBatchStartListener,
    useUploadyContext,
    useUploady,
    useUploader,
    useUploadOptions,

    logWarning,

    markAsUploadOptionsComponent,
    getIsUploadOptionsComponent,
};
