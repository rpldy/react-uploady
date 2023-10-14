import React from "react";

const UploadyContextMock = {
    showFileUpload: vi.fn(),
    getOptions: vi.fn(),
    setOptions: vi.fn(),
    setExternalFileInput: vi.fn(),
    getInternalFileInput: vi.fn(),
    upload: vi.fn(),
    getExtension: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    Provider: vi.fn(({ children }) => {
        return <div id="uploady-context-provider">{children}</div>
    }),
    createContextApi: vi.fn(),
};

export default UploadyContextMock;
