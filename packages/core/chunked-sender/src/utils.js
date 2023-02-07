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
        //$FlowExpectedError[method-unbinding] flow 0.153 !!!
        sliceMethod = Blob.prototype.slice ||
            // $FlowIssue[prop-missing] flow doesnt know webkitSlice
            Blob.prototype.webkitSlice ||
            // $FlowIssue[prop-missing] flow doesnt know mozSlice
            Blob.prototype.mozSlice;
    }

    return !!sliceMethod;
};

const CHUNKING_SUPPORT: boolean = isChunkingSupported();

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
