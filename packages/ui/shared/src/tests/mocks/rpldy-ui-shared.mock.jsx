import React from "react";
import { UploadyContextMock as MockedUploadyContext } from "./UploadyContext.mock";

//for some reason using the mock dep directly fails in tests ;(
const UploadyContextMock = MockedUploadyContext;

const assertContext = vi.fn(() => UploadyContextMock);

const createContextApi = vi.fn();

const withForwardRefMock = {
    setRef: vi.fn(),
    ref: { current: null },
};

const useBatchStartListener = vi.fn();

const logWarning = vi.fn();

const useUploadyContext = vi.fn(() => UploadyContextMock);
const useUploady = useUploadyContext;

const useUploader = vi.fn();

const useUploadOptions = vi.fn();

const NoDomUploady = vi.fn(({ children }) => <div>{children}</div>);

const markAsUploadOptionsComponent = vi.fn();
const getIsUploadOptionsComponent = vi.fn();

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

vi.doMock("@rpldy/shared-ui", () => uiSharedMock);

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
