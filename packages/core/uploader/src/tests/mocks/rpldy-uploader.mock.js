import { UPLOADER_EVENTS } from "../../consts";
import { DEFAULT_OPTIONS } from "../../defaults";

const uploader = {
    add: vi.fn(),
    upload: vi.fn(),
    clearPending: vi.fn(),
    getOptions: vi.fn(),
    on: vi.fn(),
    once: vi.fn(),
    off: vi.fn(),
    update: vi.fn(),
    abort: vi.fn(),
    abortBatch: vi.fn(),
    registerExtension: vi.fn(),
    getExtension: vi.fn(),
};

const createUploader = vi.fn(() => uploader);

createUploader.UPLOADER_EVENTS = UPLOADER_EVENTS;
createUploader.DEFAULT_OPTIONS = DEFAULT_OPTIONS;

vi.doMock("@rpldy/uploader", () => createUploader);

export {
    uploader,
    createUploader,
    UPLOADER_EVENTS,
    DEFAULT_OPTIONS,
}
