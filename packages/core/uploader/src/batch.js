// @flow
import { BATCH_STATES, createBatchItem } from "@rpldy/shared";
import { DEFAULT_FILTER } from "./defaults";
import { getIsFileList } from "./utils";

import type {
    UploadInfo,
    BatchItem,
    Batch,
    FileFilterMethod,
} from "@rpldy/shared";

import type { CreateOptions } from "./types";

let bCounter = 0;

const processFiles = (batchId, files: UploadInfo, isPending: boolean, fileFilter: ?FileFilterMethod): BatchItem[] =>
    Array.prototype
        .filter.call(files, fileFilter || DEFAULT_FILTER)
        .map((f) => createBatchItem(f, batchId, isPending));

export default (files: UploadInfo | UploadInfo[], uploaderId: string, options: CreateOptions): Batch => {
    bCounter += 1;
    const id = `batch-${bCounter}`;

    const isFileList = getIsFileList(files);

    files = (Array.isArray(files) || isFileList) ? files : [files];

    const isPending = !options.autoUpload;

    return {
        id,
        uploaderId,
        items: processFiles(id, files, isPending, options.fileFilter),
        state: isPending ? BATCH_STATES.PENDING : BATCH_STATES.ADDED,
        completed: 0,
        loaded: 0,
    };
};
