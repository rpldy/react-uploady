// @flow
import { BATCH_STATES, createBatchItem, isPromise, } from "@rpldy/shared";
import { DEFAULT_FILTER } from "./defaults";
import { getIsFileList } from "./utils";

import type {
    UploadInfo,
    BatchItem,
    Batch,
    FileFilterMethod,
} from "@rpldy/shared";

import type { UploaderCreateOptions } from "./types";

let bCounter = 0;

const processFiles = (batchId, files: UploadInfo, isPending: boolean, fileFilter: ?FileFilterMethod): Promise<BatchItem[]> => {
    const filterFn = fileFilter || DEFAULT_FILTER;

    return Promise.all(Array.prototype
        //$FlowExpectedError[method-unbinding] flow 0.153 !!!
        .map.call(files, (f) => {
            const filterResult = filterFn(f);
            return isPromise(filterResult) ?
                filterResult.then((result) => !!result && f) :
                (!!filterResult && f);
        }))
        .then((filtered) => filtered
            .filter(Boolean)
            .map((f) => createBatchItem(f, batchId, isPending)));
};

const createBatch = (files: UploadInfo | UploadInfo[], uploaderId: string, options: UploaderCreateOptions): Promise<Batch> => {
    bCounter += 1;
    const id = `batch-${bCounter}`;

    const isFileList = getIsFileList(files);

    files = (Array.isArray(files) || isFileList) ? files : [files];

    const isPending = !options.autoUpload;

    return processFiles(id, files, isPending, options.fileFilter)
        .then((items) => {
            return {
                id,
                uploaderId,
                items,
                state: isPending ? BATCH_STATES.PENDING : BATCH_STATES.ADDED,
                completed: 0,
                loaded: 0,
                orgItemCount: items.length,
                additionalInfo: null,
            };
        });
};

export default createBatch;
