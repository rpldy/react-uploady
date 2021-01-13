import { UPLOADER_EVENTS } from "../../consts";
import { DEFAULT_OPTIONS } from "../../defaults";

const uploader = {
    add: jest.fn(),
    upload: jest.fn(),
    clearPending: jest.fn(),
    getOptions: jest.fn(),
    on: jest.fn(),
    once: jest.fn(),
    off: jest.fn(),
    update: jest.fn(),
    abort: jest.fn(),
    abortBatch: jest.fn(),
    registerExtension: jest.fn(),
    getExtension: jest.fn(),
};

const createUploader = jest.fn(() => uploader);

createUploader.UPLOADER_EVENTS = UPLOADER_EVENTS;
createUploader.DEFAULT_OPTIONS = DEFAULT_OPTIONS;

jest.doMock("@rpldy/uploader", () => createUploader);

export {
    uploader,
    createUploader,
    UPLOADER_EVENTS,
    DEFAULT_OPTIONS,
}
