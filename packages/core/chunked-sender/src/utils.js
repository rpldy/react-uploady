// @flow
import { merge, hasWindow } from "@rpldy/shared";
import { DEFAULT_OPTIONS } from "./defaults";

import type { FileLike } from "@rpldy/shared";
import type { ChunkedOptions, MandatoryChunkedOptions } from "./types";

const getMandatoryOptions = (options: ?ChunkedOptions): MandatoryChunkedOptions =>
    merge({}, DEFAULT_OPTIONS, options);

let sliceMethod = null;

const isChunkingSupported = (): boolean => {
    sliceMethod = null;
    if (hasWindow() && "Blob" in window) {
        sliceMethod = Blob.prototype.slice ||
            // $FlowFixMe - flow doesnt know webkitSlice
            Blob.prototype.webkitSlice ||
            // $FlowFixMe - flow doesnt know mozSlice
            Blob.prototype.mozSlice;
    }

    return !!sliceMethod;
};

const CHUNKING_SUPPORT = isChunkingSupported();

const getChunkDataFromFile = (file: FileLike, start: number, end: number): ?Blob => {
    const blob = sliceMethod?.call(file, start, end, file.type);

    if (blob) {
        blob.name = file.name;
        blob.lastModified = file.lastModified;
    }

    return blob;
};

export {
    CHUNKING_SUPPORT,
    getMandatoryOptions,
    getChunkDataFromFile,
    isChunkingSupported, //for tests
};
