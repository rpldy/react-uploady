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

const processFiles = (batchId, files: UploadInfo, autoUpload: boolean, fileFilter: ?FileFilterMethod): BatchItem[] =>
    Array.prototype
        .filter.call(files, fileFilter || DEFAULT_FILTER)
        .map((f) => createBatchItem(f, batchId, autoUpload));

export default (files: UploadInfo | UploadInfo[], uploaderId: string, options: CreateOptions): Batch => {
    bCounter += 1;
    const id = `batch-${bCounter}`;

    const isFileList = getIsFileList(files);

    files = (Array.isArray(files) || isFileList) ? files : [files];

    return {
        id,
        uploaderId,
        items: processFiles(id, files, options.autoUpload, options.fileFilter),
        state: BATCH_STATES.ADDED,
        completed: 0,
        loaded: 0,
        isPending: !options.autoUpload,
    };
};
