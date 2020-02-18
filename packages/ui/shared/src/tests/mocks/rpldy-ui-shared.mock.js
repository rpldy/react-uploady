import React from "react";

const UploadyContext = {
    showFileUpload: jest.fn(),
    Provider: jest.fn(({ children }) =>
        <div id="uploady-context-provider">{children}</div>),
};

const assertContext = jest.fn(() => UploadyContext);

const createContextApi = jest.fn();

const uiSharedMock = {
    UploadyContext,
    assertContext,
    createContextApi,
};

jest.doMock("@rpldy/shared-ui", () => uiSharedMock);

export {
    UploadyContext,
    assertContext,
    createContextApi,
};
