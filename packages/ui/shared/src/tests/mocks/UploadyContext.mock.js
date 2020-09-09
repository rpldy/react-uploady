import React from "react";

const UploadyContextMock = {
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
    createContextApi: jest.fn(),
};

export default UploadyContextMock;
